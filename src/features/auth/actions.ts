"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { parsePassword, parseRequiredText, parseSelfAssignableRole } from "./model";

function authError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function getRegistrationErrorMessage(code: string | undefined): string {
  if (code === "over_email_send_rate_limit") {
    return "The confirmation email limit has been reached. Wait before trying again.";
  }
  if (code === "email_address_not_authorized") {
    return "Development email delivery is limited to members of this Supabase organization.";
  }
  return "Registration could not be completed.";
}

function getAuthCallbackUrl(origin: string | null): string | null {
  if (!origin) return null;

  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") return null;
    return new URL("/auth/callback?next=/account", parsedOrigin.origin).toString();
  } catch {
    return null;
  }
}

export async function login(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  const password = parsePassword(formData.get("password"));
  if (!email || !password) authError("/login", "Enter a valid email and password.");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    authError("/login", "Confirm your email address before logging in.");
  }
  if (error) authError("/login", "The email or password is incorrect.");

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function register(formData: FormData): Promise<never> {
  const displayName = parseRequiredText(formData.get("displayName"), 80);
  const email = parseRequiredText(formData.get("email"), 254);
  const password = parsePassword(formData.get("password"));
  const requestedRole = parseSelfAssignableRole(formData.get("role"));

  if (!displayName || !email || !password || !requestedRole) {
    authError("/register", "Complete every field and use a password with at least eight characters.");
  }

  const requestHeaders = await headers();
  const emailRedirectTo = getAuthCallbackUrl(requestHeaders.get("origin"));
  if (!emailRedirectTo) authError("/register", "Registration could not be completed.");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, requested_role: requestedRole },
      emailRedirectTo,
    },
  });
  if (error) authError("/register", getRegistrationErrorMessage(error.code));

  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account, then log in.")}`);
}

export async function logout(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
