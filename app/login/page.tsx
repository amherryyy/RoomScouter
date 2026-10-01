import Link from "next/link";
import { SubmitButton } from "../../src/components/submit-button";
import { PasswordField } from "../../src/components/password-field";
import { login } from "../../src/features/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <main className="auth-shell" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-title">Log in</h1>
        <p>Access your saved listings, owner dashboard, or moderation workspace.</p>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        {message ? <p className="notice success" role="status">{message}</p> : null}
        <form action={login}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <PasswordField id="password" name="password" autoComplete="current-password" required />
          <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
        </form>
        <p className="auth-switch"><Link href="/forgot-password">Forgot your password?</Link></p>
        <p className="auth-switch">New here? <Link href="/register">Create an account</Link>.</p>
      </section>
    </main>
  );
}
