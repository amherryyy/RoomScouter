import { redirect } from "next/navigation";
import { SubmitButton } from "../../src/components/submit-button";
import { updatePassword } from "../../src/features/auth/actions";
import { createServerSupabaseClient } from "../../src/lib/supabase/server";

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=Request%20a%20new%20password%20recovery%20link.");
  const { error } = await searchParams;

  return (
    <main className="auth-shell" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="update-password-title">
        <p className="eyebrow">Account recovery</p>
        <h1 id="update-password-title">Choose a new password</h1>
        <p>Use a new password with 8 to 128 characters. You will log in again after it is saved.</p>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        <form action={updatePassword}>
          <label htmlFor="password">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <label htmlFor="passwordConfirmation">Confirm new password</label>
          <input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <SubmitButton pendingLabel="Updating password…">Update password</SubmitButton>
        </form>
      </section>
    </main>
  );
}
