import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "../../src/components/auth-page";
import { SubmitButton } from "../../src/components/submit-button";
import { PasswordField } from "../../src/components/password-field";
import { login } from "../../src/features/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export const metadata: Metadata = { title: "Log in | RoomScouter" };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <AuthPage
      titleId="login-title"
      eyebrow="Welcome back"
      title="Log in to your account"
      description="Access saved listings, property management, or moderation tools based on your role."
      footer={<p>New to RoomScouter? <Link href="/register">Create an account</Link>.</p>}
    >
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {message ? <p className="notice success" role="status">{message}</p> : null}
        <form action={login}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <PasswordField id="password" name="password" autoComplete="current-password" required />
          <div className="auth-form-help"><Link href="/forgot-password">Forgot your password?</Link></div>
          <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
        </form>
    </AuthPage>
  );
}
