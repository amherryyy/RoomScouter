type PageSkeletonProps = {
  label: string;
  variant?: "grid" | "detail" | "form" | "admin";
};

export function PageSkeleton({ label, variant = "grid" }: PageSkeletonProps) {
  return (
    <main className={`skeleton-page skeleton-${variant}`} id="main-content" tabIndex={-1} aria-busy="true">
      <p className="visually-hidden" role="status" aria-live="polite">{label}</p>
      <div className="skeleton-line skeleton-eyebrow" aria-hidden="true" />
      <div className="skeleton-line skeleton-title" aria-hidden="true" />
      <div className="skeleton-line skeleton-copy" aria-hidden="true" />
      {variant === "admin" ? (
        <div className="skeleton-admin" aria-hidden="true">
          <div className="skeleton-admin-summary">
            {Array.from({ length: 4 }, (_, index) => <div className="skeleton-panel" key={index} />)}
          </div>
          <div className="skeleton-line skeleton-admin-heading" />
          <div className="skeleton-admin-queues">
            {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel" key={index} />)}
          </div>
          <div className="skeleton-line skeleton-admin-heading" />
          <div className="skeleton-line skeleton-admin-tabs" />
          <div className="skeleton-card-grid skeleton-admin-list">
            {Array.from({ length: 20 }, (_, index) => <div className="skeleton-panel skeleton-card" key={index} />)}
          </div>
        </div>
      ) : variant === "form" ? (
        <div className="skeleton-panel skeleton-form-panel" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="skeleton-field" key={index}>
              <div className="skeleton-line skeleton-label" />
              <div className="skeleton-input" />
            </div>
          ))}
        </div>
      ) : variant === "detail" ? (
        <div className="skeleton-detail-layout" aria-hidden="true">
          <div className="skeleton-panel skeleton-detail-body" />
          <div className="skeleton-panel skeleton-detail-side" />
        </div>
      ) : (
        <div className="skeleton-card-grid" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel skeleton-card" key={index} />)}
        </div>
      )}
    </main>
  );
}
