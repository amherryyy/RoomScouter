import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPage } from "../../src/components/auth-page";
import { SubmitButton } from "../../src/components/submit-button";
import { PasswordField } from "../../src/components/password-field";
import { updatePassword } from "../../src/features/auth/actions";
import { createServerSupabaseClient } from "../../src/lib/supabase/server";

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = { title: "Choose a new password | RoomScouter" };

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=Request%20a%20new%20password%20recovery%20link.");
  const { error } = await searchParams;

  return (
    <AuthPage
      titleId="update-password-title"
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use 8 to 128 characters. You will log in again after the new password is saved."
      footer={<p>Your recovery session is temporary and ends after this password is updated.</p>}
    >
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        <form action={updatePassword}>
          <label htmlFor="password">New password</label>
          <PasswordField id="password" name="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <label htmlFor="passwordConfirmation">Confirm new password</label>
          <PasswordField id="passwordConfirmation" name="passwordConfirmation" autoComplete="new-password" minLength={8} maxLength={128} required />
          <SubmitButton pendingLabel="Updating password…">Update password</SubmitButton>
        </form>
    </AuthPage>
  );
}
