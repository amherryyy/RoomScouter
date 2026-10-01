import Link from "next/link";
import { SubmitButton } from "../../src/components/submit-button";
import { PasswordField } from "../../src/components/password-field";
import { register } from "../../src/features/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <main className="auth-shell" id="main-content" tabIndex={-1}>
      <section className="auth-card" aria-labelledby="register-title">
        <p className="eyebrow">Join the pilot</p>
        <h1 id="register-title">Create an account</h1>
        <p>Choose how you will use RoomScouter. Administrator access cannot be self-assigned.</p>
        {error ? <p className="notice error" role="alert">{error}</p> : null}
        <form action={register}>
          <label htmlFor="displayName">Display name</label>
          <input id="displayName" name="displayName" type="text" autoComplete="name" maxLength={80} required />
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <PasswordField id="password" name="password" autoComplete="new-password" minLength={8} aria-describedby="password-help" required />
          <p className="field-help" id="password-help">Use at least eight characters.</p>
          <label htmlFor="role">I am a</label>
          <select id="role" name="role" defaultValue="student" required>
            <option value="student">Student looking for a place</option>
            <option value="owner">Boarding-house owner</option>
          </select>
          <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
        </form>
        <p className="auth-switch">Already registered? <Link href="/login">Log in</Link>.</p>
      </section>
    </main>
  );
}
