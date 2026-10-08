type PageSkeletonProps = {
  label: string;
  variant?: "grid" | "detail" | "form" | "admin" | "discovery" | "browse" | "owner" | "account" | "editor" | "queue" | "reports" | "moderation-detail" | "favorites" | "report-history";
};

export function PageSkeleton({ label, variant = "grid" }: PageSkeletonProps) {
  return (
    <main className={`skeleton-page skeleton-${variant}`} id="main-content" tabIndex={-1} aria-busy="true">
      <p className="visually-hidden" role="status" aria-live="polite">{label}</p>
      {variant === "discovery" ? <><SkeletonPublicHeader /><SkeletonDiscovery /></>
        : variant === "browse" ? <><SkeletonPublicHeader /><SkeletonBrowse /></>
          : variant === "owner" ? <SkeletonOwner />
            : variant === "account" ? <><SkeletonAccountHeader /><SkeletonAccount /></>
              : variant === "editor" ? <SkeletonEditor />
                : variant === "queue" ? <SkeletonQueue />
                  : variant === "reports" ? <SkeletonReports showTabs />
                    : variant === "report-history" ? <SkeletonReports />
                      : variant === "favorites" ? <SkeletonFavorites />
                        : variant === "moderation-detail" ? <SkeletonModerationDetail />
                          : variant === "admin" ? (
        <div className="skeleton-admin" aria-hidden="true">
          <SkeletonWorkspaceHeading />
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
            {Array.from({ length: 20 }, (_, index) => (
              <div className="skeleton-panel skeleton-admin-listing" key={index}>
                <div className="skeleton-line skeleton-copy-wide" />
                <div className="skeleton-line skeleton-copy-medium" />
                <div className="skeleton-line skeleton-copy-wide" />
                <div className="skeleton-line skeleton-copy-short" />
              </div>
            ))}
          </div>
        </div>
      ) : variant === "form" ? (
        <>
          <SkeletonWorkspaceHeading />
          <div className="skeleton-panel skeleton-form-panel" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="skeleton-field" key={index}>
                <div className="skeleton-line skeleton-label" />
                <div className="skeleton-input" />
              </div>
            ))}
          </div>
        </>
      ) : variant === "detail" ? (
        <>
          <SkeletonPublicHeader />
          <SkeletonPublicDetail />
        </>
      ) : (
        <div className="skeleton-card-grid" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel skeleton-card" key={index} />)}
        </div>
      )}
    </main>
  );
}

function SkeletonPublicHeader() {
  return (
    <div className="skeleton-public-header" aria-hidden="true">
      <div className="skeleton-line skeleton-brand" />
      <div className="skeleton-public-nav">
        {Array.from({ length: 5 }, (_, index) => <div className="skeleton-line" key={index} />)}
      </div>
    </div>
  );
}

function SkeletonAccountHeader() {
  return (
    <div className="skeleton-account-header" aria-hidden="true">
      <div className="skeleton-line skeleton-brand" />
      <div className="skeleton-line skeleton-account-link" />
    </div>
  );
}

function SkeletonWorkspaceHeading() {
  return (
    <div className="skeleton-workspace-heading" aria-hidden="true">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-copy" />
      <div className="skeleton-heading-actions"><div className="skeleton-panel" /><div className="skeleton-panel" /></div>
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton-panel skeleton-content-card ${className}`} aria-hidden="true">
      <div className="skeleton-media" />
      <div className="skeleton-card-copy">
        <div className="skeleton-line skeleton-copy-wide" />
        <div className="skeleton-line skeleton-copy-medium" />
        <div className="skeleton-line skeleton-copy-short" />
        <div className="skeleton-line skeleton-copy-medium" />
      </div>
    </div>
  );
}

function SkeletonSectionHeading() {
  return (
    <div className="skeleton-section-heading" aria-hidden="true">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-title" />
    </div>
  );
}

function SkeletonDiscovery() {
  return (
    <div className="skeleton-discovery-content" aria-hidden="true">
      <section className="skeleton-discovery-hero">
        <div className="skeleton-hero-copy">
          <div className="skeleton-line skeleton-eyebrow" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-copy" />
          <div className="skeleton-search-control"><div className="skeleton-line" /><div className="skeleton-panel" /></div>
          <div className="skeleton-quick-links"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div>
        </div>
        <div className="skeleton-panel skeleton-hero-art" />
      </section>
      <SkeletonSectionHeading />
      <div className="skeleton-card-grid skeleton-featured">
        {Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)}
      </div>
    </div>
  );
}

function SkeletonBrowse() {
  return (
    <div className="skeleton-browse-content" aria-hidden="true">
      <section className="skeleton-browse-hero">
        <div className="skeleton-line skeleton-eyebrow" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-copy" />
        <div className="skeleton-search-control"><div className="skeleton-line" /><div className="skeleton-panel" /></div>
      </section>
      <div className="skeleton-browse-layout">
        <div className="skeleton-panel skeleton-filter-panel">
          {Array.from({ length: 7 }, (_, index) => <div className="skeleton-field" key={index}><div className="skeleton-line skeleton-label" /><div className="skeleton-input" /></div>)}
          <div className="skeleton-input skeleton-filter-submit" />
        </div>
        <section>
          <SkeletonSectionHeading />
          <div className="skeleton-card-grid skeleton-results-grid">
            {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

function SkeletonOwner() {
  return (
    <div className="skeleton-owner-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      <div className="skeleton-owner-summary">
        {Array.from({ length: 5 }, (_, index) => <div className="skeleton-panel" key={index}><div className="skeleton-line" /><div className="skeleton-line skeleton-metric" /></div>)}
      </div>
      <SkeletonSectionHeading />
      <div className="skeleton-owner-list">
        {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel skeleton-owner-row" key={index}><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-input" /></div>)}
      </div>
      <div className="skeleton-panel skeleton-owner-note" />
    </div>
  );
}

function SkeletonAccount() {
  return (
    <div className="skeleton-account-content" aria-hidden="true">
      <div className="skeleton-panel skeleton-account-summary"><div className="skeleton-avatar" /><div><div className="skeleton-line skeleton-title" /><div className="skeleton-line skeleton-copy" /></div><div className="skeleton-account-meta"><div className="skeleton-line" /><div className="skeleton-line" /></div></div>
      <div className="skeleton-account-settings">
        <div className="skeleton-panel skeleton-account-settings-panel"><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-input" /><div className="skeleton-input" /></div>
        <div className="skeleton-panel skeleton-account-settings-panel"><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /></div>
      </div>
      <SkeletonSectionHeading />
      <div className="skeleton-account-actions">
        {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel skeleton-action-card" key={index}><div className="skeleton-line skeleton-copy-short" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /></div>)}
      </div>
    </div>
  );
}

function SkeletonEditor() {
  return (
    <div className="skeleton-editor-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      <div className="skeleton-panel skeleton-editor-form">
        <div className="skeleton-line skeleton-editor-legend" />
        <div className="skeleton-editor-fields">
          {Array.from({ length: 9 }, (_, index) => <div className="skeleton-field" key={index}><div className="skeleton-line skeleton-label" /><div className="skeleton-input" /></div>)}
        </div>
      </div>
      <SkeletonSectionHeading />
      <div className="skeleton-editor-attributes">
        {Array.from({ length: 3 }, (_, index) => <div className="skeleton-panel skeleton-editor-attribute" key={index}><div className="skeleton-line skeleton-editor-legend" />{Array.from({ length: 4 }, (_, row) => <div className="skeleton-line skeleton-copy-medium" key={row} />)}<div className="skeleton-input skeleton-filter-submit" /></div>)}
      </div>
      <SkeletonSectionHeading />
      <div className="skeleton-card-grid skeleton-editor-photos">{Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)}</div>
    </div>
  );
}

function SkeletonQueue() {
  return (
    <div className="skeleton-queue-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      <div className="skeleton-queue-tabs"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div>
      <div className="skeleton-queue-list">
        {Array.from({ length: 5 }, (_, index) => <div className="skeleton-panel skeleton-queue-card" key={index}><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-input" /></div>)}
      </div>
    </div>
  );
}

function SkeletonReports({ showTabs = false }: { showTabs?: boolean }) {
  return (
    <div className="skeleton-reports-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      {showTabs ? <div className="skeleton-queue-tabs"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div> : null}
      <div className="skeleton-report-list">
        {Array.from({ length: 4 }, (_, index) => <div className="skeleton-panel skeleton-report-card" key={index}><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /></div>)}
      </div>
    </div>
  );
}

function SkeletonFavorites() {
  return (
    <div className="skeleton-favorites-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      <div className="skeleton-card-grid skeleton-results-grid">
        {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
      </div>
    </div>
  );
}

function SkeletonModerationDetail() {
  return (
    <div className="skeleton-moderation-content" aria-hidden="true">
      <SkeletonWorkspaceHeading />
      <div className="skeleton-detail-layout">
        <div className="skeleton-moderation-sections">
          {Array.from({ length: 6 }, (_, index) => <div className="skeleton-panel skeleton-detail-section" key={index}><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /></div>)}
        </div>
        <div className="skeleton-panel skeleton-detail-side" />
      </div>
    </div>
  );
}

function SkeletonPublicDetail() {
  return (
    <div className="skeleton-public-detail" aria-hidden="true">
      <div className="skeleton-line skeleton-eyebrow" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-detail-layout skeleton-public-detail-layout">
        <div className="skeleton-moderation-sections">
          <div className="skeleton-panel skeleton-public-gallery" />
          <div className="skeleton-panel skeleton-detail-section"><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /><div className="skeleton-line skeleton-copy-medium" /></div>
          <div className="skeleton-panel skeleton-detail-section"><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-line skeleton-copy-wide" /></div>
        </div>
        <div className="skeleton-panel skeleton-detail-side skeleton-price-panel"><div className="skeleton-line skeleton-copy-short" /><div className="skeleton-line skeleton-title" /><div className="skeleton-line skeleton-copy-medium" /><div className="skeleton-input" /></div>
      </div>
    </div>
  );
}
