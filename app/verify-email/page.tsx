import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "../../src/components/auth-page";
import { SubmitButton } from "../../src/components/submit-button";
import { resendSignupVerification, verifySignupEmail } from "../../src/features/auth/actions";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string; error?: string; message?: string }>;
};

export const metadata: Metadata = { title: "Verify your email | RoomScouter" };

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email, error, message } = await searchParams;
  const defaultEmail = typeof email === "string" ? email.slice(0, 254) : "";

  return (
    <AuthPage
      titleId="verify-email-title"
      eyebrow="One more step"
      title="Verify your email"
      description="Enter the verification code we sent to your inbox to finish creating your account."
      footer={<p>Need to change your email? <Link href="/register">Back to registration</Link>.</p>}
    >
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      {message ? <p className="notice success" role="status">{message}</p> : null}
      <form action={verifySignupEmail}>
        <label htmlFor="verification-email">Email address</label>
        <input id="verification-email" name="email" type="email" autoComplete="email" maxLength={254} defaultValue={defaultEmail} required />
        <label htmlFor="verification-token">Verification code</label>
        <input id="verification-token" name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} aria-describedby="verification-help" required />
        <p className="field-help" id="verification-help">Enter the 6-digit code. It expires after a limited time; you can request a new one below.</p>
        <SubmitButton pendingLabel="Verifying…">Verify email</SubmitButton>
        <SubmitButton formAction={resendSignupVerification} pendingLabel="Sending…" className="auth-resend-button">Resend code</SubmitButton>
      </form>
    </AuthPage>
  );
}
