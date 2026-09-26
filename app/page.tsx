import Link from "next/link";

export default function Home() {
  return (
    <main>
      <p className="eyebrow">One trusted place to start</p>
      <h1>Find a boarding house that fits student life.</h1>
      <p className="lede">Compare rent, distance, availability, facilities, utilities, and house rules near your university.</p>
      <div className="actions">
        <Link className="button" href="/register">Create an account</Link>
        <Link className="button secondary" href="/login">Log in</Link>
      </div>
    </main>
  );
}
