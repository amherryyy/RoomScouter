"use client";

import { useState, type FormEvent } from "react";
import { UiIcon } from "./ui-icon";

export function ProblemReportForm() {
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
    const issue = new URL("https://github.com/amherryyy/RoomScouter/issues/new");
    issue.searchParams.set("title", `[Problem report] ${subject}`);
    issue.searchParams.set("body", `## Problem report\n\n${message}\n\n---\nDrafted on the RoomScouter website. Review this report before submitting it on GitHub.`);
    window.location.assign(issue.toString());
  }

  return (
    <form className="developer-feedback-form" onSubmit={continueToGitHub}>
      <label htmlFor="feedback-subject">Subject</label>
      <input id="feedback-subject" name="subject" maxLength={120} required placeholder="Briefly describe the problem" />

      <label htmlFor="feedback-message">What happened?</label>
      <textarea id="feedback-message" name="message" maxLength={3000} required rows={7} placeholder="Add the steps and details needed to understand the problem." />

      {error ? <p className="developer-feedback-error" role="alert">{error}</p> : null}
      <button className="developer-feedback-submit" type="submit"><UiIcon className="ui-icon" name="github" /><span>Continue to GitHub Issues</span></button>
      <p className="developer-feedback-note">Your report will be prefilled in a public GitHub issue. Review and submit it there. Leave out passwords, account details, and private rental information.</p>
    </form>
  );
}
