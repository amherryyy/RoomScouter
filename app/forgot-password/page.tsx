import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "../../src/components/auth-page";
import { SubmitButton } from "../../src/components/submit-button";
import { requestPasswordReset } from "../../src/features/auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export const metadata: Metadata = { title: "Reset password | RoomScouter" };

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, message } = await searchParams;

  return (
    <AuthPage
      titleId="recovery-title"
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email. If it matches an account, we will send a time-limited recovery link."
      footer={<p>Remembered your password? <Link href="/login">Return to login</Link>.</p>}
    >
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {message ? <p className="notice success" role="status">{message}</p> : null}
        <form action={requestPasswordReset}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <SubmitButton pendingLabel="Sending recovery link…">Send recovery link</SubmitButton>
        </form>
    </AuthPage>
  );
}
