# Accessibility and responsive-use baseline

RoomScouter's pilot interface targets keyboard, screen-reader, high-contrast, zoom, and 360-pixel-wide use for every primary workflow. This baseline complements automated contract tests; it does not claim formal WCAG certification.

## Implemented baseline

- Every page has one main landmark and a keyboard-visible skip link.
- Page language and product-specific metadata are declared globally.
- Forms use programmatic labels, browser autocomplete where appropriate, bounded inputs, and associated help text for important constraints.
- Errors use alert semantics and successful outcomes use status semantics.
- Queue tabs identify the current page without relying only on color.
- Keyboard focus has a consistent high-contrast indicator.
- Status chips remain distinguishable by text and receive borders in forced-colors mode.
- Layouts collapse at 40rem, navigation actions wrap, and pagination becomes a vertical touch-friendly control at narrow widths.
- Images have meaningful alternative text; external map navigation announces that it opens a new tab.
- Route transitions announce a concise loading status while decorative skeleton shapes stay hidden from assistive technology.
- Server-action buttons announce task-specific progress and disable during submission to prevent duplicate writes.

## Manual pilot check

Before a demonstration or deployment, verify these flows at 360px width, 200% browser zoom, keyboard-only navigation, and Windows High Contrast mode:

1. Register, confirm, log in, and log out.
2. Search and filter listings, open details, save a listing, write a review, and submit a report.
3. Create and submit an owner listing, including attributes and photos.
4. Approve or reject a listing, hide or restore a review, and resolve or dismiss a report.

Confirm that focus remains visible, the skip link reaches the main content, no horizontal page scrolling is required, validation guidance is announced, and every action remains reachable without a pointer.

Skeleton animation must stop when reduced motion is requested and remain distinguishable in Windows High Contrast mode.
