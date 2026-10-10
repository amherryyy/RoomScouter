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
    return "The verification email limit has been reached. Wait before trying again.";
  }
  if (code === "email_address_not_authorized") {
    return "Development email delivery is limited to members of this Supabase organization.";
  }
  return "Registration could not be completed.";
}

function getAuthCallbackUrl(origin: string | null, nextPath: "/account" | "/update-password"): string | null {
  const configuredOrigin = process.env.ROOMSCOUTER_SITE_URL?.trim();
  const candidate = configuredOrigin || origin;
  if (!candidate) return null;

  try {
    const parsedOrigin = new URL(candidate);
    if (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") return null;
    const callback = new URL("/auth/callback", parsedOrigin.origin);
    callback.searchParams.set("next", nextPath);
    return callback.toString();
  } catch {
    return null;
  }
}

export async function login(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  const password = parsePassword(formData.get("password"));
  if (!email || !password) authError("/login", "Enter a valid email and password.");

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent("Verify your email address to finish signing in.")}`);
  }
  if (error) authError("/login", "The email or password is incorrect.");

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  revalidatePath("/", "layout");
  redirect(profile?.role === "owner" ? "/owner" : profile?.role === "admin" ? "/admin" : "/account");
}

export async function register(formData: FormData): Promise<never> {
  const displayName = parseRequiredText(formData.get("displayName"), 80);
  const email = parseRequiredText(formData.get("email"), 254);
  const password = parsePassword(formData.get("password"));
  const requestedRole = parseSelfAssignableRole(formData.get("role"));
  const acceptedPolicies = formData.get("acceptPolicies") === "yes";

  if (!displayName || !email || !password || !requestedRole || !acceptedPolicies) {
    authError("/register", "Complete every field and use a password with at least eight characters.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        requested_role: requestedRole,
        accepted_terms_version: "2026-10-09",
        accepted_privacy_notice_version: "2026-10-09",
        accepted_at: new Date().toISOString(),
      },
    },
  });
  if (error) authError("/register", getRegistrationErrorMessage(error.code));

  redirect(`/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent("We sent a verification code to your email address.")}`);
}

export async function verifySignupEmail(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  const token = parseRequiredText(formData.get("token"), 8);
  if (!email || !email.includes("@") || !token || !/^\d{6,8}$/.test(token)) {
    authError("/verify-email", "Enter your email address and the verification code.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent("That code is invalid or expired. Request a new code and try again.")}`);
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function resendSignupVerification(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  if (!email || !email.includes("@")) authError("/verify-email", "Enter a valid email address.");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) {
    const message = error.code === "over_email_send_rate_limit"
      ? "Please wait before requesting another verification code."
      : "A new verification code could not be sent. Check the email address or try again later.";
    redirect(`/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`);
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent("A new verification code has been sent.")}`);
}

export async function requestPasswordReset(formData: FormData): Promise<never> {
  const email = parseRequiredText(formData.get("email"), 254);
  if (!email || !email.includes("@")) authError("/forgot-password", "Enter a valid email address.");

  const requestHeaders = await headers();
  const redirectTo = getAuthCallbackUrl(requestHeaders.get("origin"), "/update-password");
  if (!redirectTo) authError("/forgot-password", "Password recovery is temporarily unavailable.");

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  redirect(`/forgot-password?message=${encodeURIComponent(
    "If an account exists for that email, a recovery link has been sent. If it does not arrive, wait a few minutes before trying again.",
  )}`);
}

export async function updatePassword(formData: FormData): Promise<never> {
  const password = parsePassword(formData.get("password"));
  const confirmation = formData.get("passwordConfirmation");
  if (!password || confirmation !== password) {
    authError("/update-password", "Use 8 to 128 characters and enter the same password twice.");
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) authError("/forgot-password", "Request a new password recovery link.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) authError("/update-password", "The password could not be updated. Request a new recovery link.");

  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect(`/login?message=${encodeURIComponent("Password updated. Log in with your new password.")}`);
}

export async function logout(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
