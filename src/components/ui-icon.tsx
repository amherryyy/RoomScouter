import type { ReactNode, SVGProps } from "react";

export type UiIconName = "home" | "browse" | "map" | "info" | "account" | "dashboard" | "reviews" | "reports" | "menu" | "logout" | "search" | "clear" | "close" | "chevron-down" | "walk" | "bicycle" | "tricycle" | "copyright" | "help" | "mail" | "license" | "github" | "user-plus";

type UiIconProps = SVGProps<SVGSVGElement> & { name: UiIconName };

const paths: Record<UiIconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  browse: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /><path d="M8 10.8h5.5M10.8 8v5.5" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
  reviews: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></>,
  reports: <><path d="M5 21V4" /><path d="M5 4h13l-2.5 4L18 12H5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  clear: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></>,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  walk: <><circle cx="13.5" cy="4.5" r="1.8" /><path d="m11.5 9 2.2-1.2 2.1 2.6 2.4 1M11.5 9l-2 4.2 3.2 2.1-1.4 4.2M12.7 15.3l3.5 1.8 1.8 3" /></>,
  bicycle: <><circle cx="6" cy="17" r="4" /><circle cx="18" cy="17" r="4" /><path d="m6 17 4-7 4 7H6Zm4-7h4m-1 0 3 7m-5-10h-2" /></>,
  tricycle: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M6 18h7l-2-7H8l-2 7Zm5-7h5l2 7m-9-7H7M15 8h4l1.5 3H15V8Z" /></>,
  copyright: <><circle cx="12" cy="12" r="9" /><path d="M15 9.5a3.3 3.3 0 1 0 0 5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-1.1 1.1-1.9 1.4-1.9 3M12 17h.01" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  license: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M8 12h8M8 16h8" /></>,
  github: <><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.8a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7s-1.2-.4-3.8 1.4a13 13 0 0 0-6.9 0C5.5.9 4.3 1.3 4.3 1.3a4.9 4.9 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.2 6.5 6.2 6.8a3.4 3.4 0 0 0-.9 2.6V22" /></>,
  "user-plus": <><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M19 8v6m-3-3h6" /></>,
};

export function UiIcon({ name, ...props }: UiIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
}
