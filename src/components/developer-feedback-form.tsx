"use client";

import { useState, type FormEvent } from "react";
import { UiIcon } from "./ui-icon";

type FeedbackKind = "contact" | "problem";

export function DeveloperFeedbackForm({ initialKind }: { initialKind: FeedbackKind }) {
  const [kind, setKind] = useState<FeedbackKind>(initialKind);
  const [error, setError] = useState("");

  function continueToGitHub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    if (!subject || !message) {
      setError("Enter a subject and message before continuing.");
      return;
    }
    setError("");
    const kindLabel = kind === "problem" ? "Problem report" : "Developer contact";
    const issue = new URL("https://github.com/amherryyy/RoomScouter/issues/new");
    issue.searchParams.set("title", `[${kindLabel}] ${subject}`);
    issue.searchParams.set("body", `## ${kindLabel}\n\n${message}\n\n---\nDrafted on the RoomScouter website. Review this message before submitting it on GitHub.`);
    window.location.assign(issue.toString());
  }

  return (
    <form className="developer-feedback-form" onSubmit={continueToGitHub}>
      <label htmlFor="feedback-kind">What would you like to do?</label>
      <select id="feedback-kind" name="kind" value={kind} onChange={(event) => setKind(event.target.value as FeedbackKind)}>
        <option value="contact">Contact the developers</option>
        <option value="problem">Report a problem</option>
      </select>

      <label htmlFor="feedback-subject">Subject</label>
      <input id="feedback-subject" name="subject" maxLength={120} required placeholder={kind === "problem" ? "Briefly describe the problem" : "What would you like to ask?"} />

      <label htmlFor="feedback-message">Message</label>
      <textarea id="feedback-message" name="message" maxLength={3000} required rows={7} placeholder="Add the details the developers need to know." />

      {error ? <p className="developer-feedback-error" role="alert">{error}</p> : null}
      <button className="developer-feedback-submit" type="submit"><UiIcon className="ui-icon" name="github" /><span>Continue to GitHub Issues</span></button>
      <p className="developer-feedback-note">Your message will be prefilled in a public GitHub issue. Review and submit it there. Leave out passwords, account details, and private rental information.</p>
    </form>
  );
}
