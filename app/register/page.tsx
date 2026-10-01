import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "../../src/components/auth-page";
import { SubmitButton } from "../../src/components/submit-button";
import { PasswordField } from "../../src/components/password-field";
import { register } from "../../src/features/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = { title: "Create an account | RoomScouter" };

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <AuthPage
      titleId="register-title"
      eyebrow="Join RoomScouter"
      title="Create your account"
      description="Choose the role that matches how you will use the platform."
      footer={<p>Already registered? <Link href="/login">Log in</Link>.</p>}
    >
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
          <p className="auth-security-note">Administrator access is provisioned separately and cannot be selected during registration.</p>
          <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
        </form>
    </AuthPage>
  );
}
