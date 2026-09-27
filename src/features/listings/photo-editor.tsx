"use client";

import { type ChangeEvent, useEffect, useState } from "react";

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
  uploadAction: (formData: FormData) => void | Promise<void>;
  saveAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (photoId: string, formData: FormData) => void | Promise<void>;
};

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function PhotoEditor({ photos, uploadAction, saveAction, deleteAction }: PhotoEditorProps) {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
  }, [selectedPreview]);

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

      <form action={uploadAction} className="attribute-card photo-upload-form">
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
        <button type="submit" disabled={photos.length >= 10}>Upload photo</button>
      </form>

      {photos.length ? (
        <form action={saveAction} className="photo-grid-form">
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
                <button className="danger-button" type="submit" formAction={deleteAction.bind(null, photo.id)}>
                  Remove photo
                </button>
              </article>
            ))}
          </div>
          <button type="submit" className="secondary">Save photo order and descriptions</button>
        </form>
      ) : (
        <p className="empty-state">No photos yet. Add the clearest view first.</p>
      )}
    </section>
  );
}
