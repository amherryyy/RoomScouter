"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { parsePassword, parseRequiredText, parseSelfAssignableRole } from "./model";

function authError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  const password = parsePassword(formData.get("password"));
  if (!email || !password) authError("/login", "Enter a valid email and password.");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, requested_role: requestedRole } }
  });
  if (error) authError("/register", "Registration could not be completed.");

  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account, then log in.")}`);
}

export async function logout(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
