"use client";

import { useActionState } from "react";
import { SubmitButton } from "../../components/submit-button";
import { updateOwnDisplayName } from "./actions";
import { initialProfileFormState } from "./profile-form-state";

export function ProfileForm({ initialDisplayName }: { initialDisplayName: string }) {
  const [state, formAction] = useActionState(updateOwnDisplayName, initialProfileFormState);
  return (
    <form className="profile-editor-form" action={formAction}>
      <div className="profile-editor-field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" type="text" autoComplete="name" defaultValue={initialDisplayName} maxLength={80} required aria-describedby="display-name-help" />
        <p className="field-help" id="display-name-help">Use 1 to 80 characters. Your account type and permissions are managed separately.</p>
      </div>
      {state.message ? <p className={state.status === "success" ? "notice success" : "notice error"} role={state.status === "success" ? "status" : "alert"}>{state.message}</p> : null}
      <SubmitButton pendingLabel="Saving profile…">Save display name</SubmitButton>
    </form>
  );
}
