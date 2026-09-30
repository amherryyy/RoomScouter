import Link from "next/link";
import { SubmitButton } from "../../src/components/submit-button";
import { requestPasswordReset } from "../../src/features/auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="auth-shell" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="recovery-title">
        <p className="eyebrow">Account recovery</p>
        <h1 id="recovery-title">Reset your password</h1>
        <p>Enter your account email. If it matches an account, Supabase will send a time-limited recovery link.</p>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {message ? <p className="notice success" role="status">{message}</p> : null}
        <form action={requestPasswordReset}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <SubmitButton pendingLabel="Sending recovery link…">Send recovery link</SubmitButton>
        </form>
        <p className="auth-switch"><Link href="/login">Return to login</Link>.</p>
      </section>
    </main>
  );
}
