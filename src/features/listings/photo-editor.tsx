"use client";

import { type ChangeEvent, useActionState, useEffect, useState } from "react";
import { SubmitButton } from "../../components/submit-button";
import { ActionNotice } from "./action-notice";
import { initialListingFormState, type ListingFormState } from "./listing-form-state";

type ListingPhoto = {
  id: string;
  alt_text: string;
  byte_size: number;
  media_type: string;
  position: number;
  signedUrl: string | null;
};

type PhotoEditorProps = {
  photos: ListingPhoto[];
  uploadAction: (previousState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  saveAction: (previousState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  deleteAction: (previousState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
};

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function PhotoEditor({ photos, uploadAction, saveAction, deleteAction }: PhotoEditorProps) {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [uploadState, uploadFormAction] = useActionState(uploadAction, initialListingFormState);
  const [saveState, saveFormAction] = useActionState(saveAction, initialListingFormState);
  const [deleteState, deleteFormAction] = useActionState(deleteAction, initialListingFormState);

  useEffect(() => () => {
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
  }, [selectedPreview]);

  useEffect(() => {
    if (uploadState.status === "success") setSelectedPreview(null);
  }, [uploadState]);

  function previewSelection(event: ChangeEvent<HTMLInputElement>) {
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    const file = event.target.files?.[0];
    setSelectedPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <section className="photo-editor" aria-labelledby="photos-title">
      <div>
        <p className="eyebrow">Photo gallery</p>
        <h2 id="photos-title">Show students the space</h2>
        <p>Upload up to ten JPEG or PNG photos. Each photo needs a useful description.</p>
      </div>
      <ActionNotice state={deleteState} />

      <form action={uploadFormAction} className="attribute-card photo-upload-form">
        <ActionNotice state={uploadState} />
        <label htmlFor="listing-photo">Photo</label>
        <input
          id="listing-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png"
          required
          disabled={photos.length >= 10}
          onChange={previewSelection}
        />
        {selectedPreview ? (
          <img className="photo-preview selected-photo-preview" src={selectedPreview} alt="Selected upload preview" />
        ) : null}
        <label htmlFor="photo-alt-text">Photo description</label>
        <input
          id="photo-alt-text"
          name="altText"
          minLength={3}
          maxLength={200}
          required
          disabled={photos.length >= 10}
          placeholder="Example: Bright furnished room with study desk"
        />
        <p className="field-help">JPEG or PNG, maximum 10 MiB. {10 - photos.length} slots remaining.</p>
        <SubmitButton pendingLabel="Uploading photo…" disabled={photos.length >= 10}>Upload photo</SubmitButton>
      </form>

      {photos.length ? (
        <form action={saveFormAction} className="photo-grid-form">
          <ActionNotice state={saveState} />
          <div className="photo-grid">
            {photos.map((photo) => (
              <article className="photo-card" key={photo.id}>
                {photo.signedUrl ? (
                  <img className="photo-preview" src={photo.signedUrl} alt={photo.alt_text} />
                ) : (
                  <div className="photo-preview preview-unavailable">Preview unavailable</div>
                )}
                <input type="hidden" name="photoIds" value={photo.id} />
                <p className="photo-metadata">{photo.media_type.replace("image/", "").toUpperCase()} · {formatBytes(photo.byte_size)}</p>
                <label htmlFor={`photo-alt-${photo.id}`}>Alternative text</label>
                <textarea
                  id={`photo-alt-${photo.id}`}
                  name={`photoAltText:${photo.id}`}
                  defaultValue={photo.alt_text}
                  minLength={3}
                  maxLength={200}
                  required
                />
                <label htmlFor={`photo-position-${photo.id}`}>Position</label>
                <select
                  id={`photo-position-${photo.id}`}
                  name={`photoPosition:${photo.id}`}
                  defaultValue={photo.position}
                >
                  {photos.map((_, index) => <option value={index + 1} key={index + 1}>{index + 1}</option>)}
                </select>
                <SubmitButton className="danger-button" pendingLabel="Removing photo…" formAction={deleteFormAction} name="photoId" value={photo.id}>
                  Remove photo
                </SubmitButton>
              </article>
            ))}
          </div>
          <SubmitButton pendingLabel="Saving photo details…" className="secondary">Save photo order and descriptions</SubmitButton>
        </form>
      ) : (
        <p className="empty-state">No photos yet. Add the clearest view first.</p>
      )}
    </section>
  );
}
