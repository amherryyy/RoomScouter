"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { UiIcon, type UiIconName } from "./ui-icon";

type ResponsiveNavigationProps = {
  children: ReactNode;
  className?: string;
  displayName?: string;
  initial?: string;
  email?: string | null;
  roleLabel?: string;
  mobileAccount: ReactNode;
};

export function ResponsiveNavigation({
  children,
  className = "",
  displayName,
  initial = "R",
  email,
  roleLabel,
  mobileAccount,
}: ResponsiveNavigationProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={"responsive-navigation " + className} ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open
          ? "Close profile and navigation menu"
          : displayName
            ? "Open profile and navigation menu for " + displayName
            : "Open navigation menu"}
        className="responsive-navigation-toggle profile-menu-trigger"
        onClick={() => setOpen((value) => !value)}
        ref={toggleRef}
        type="button"
      >
        {displayName ? (
          <>
            <span className="profile-menu-avatar" aria-hidden="true">{initial}</span>
            <span className="profile-menu-name">{displayName}</span>
            <UiIcon className="ui-icon profile-menu-chevron" name="chevron-down" />
          </>
        ) : <><UiIcon className="ui-icon" name={open ? "close" : "menu"} /><span>Menu</span></>}
      </button>
      <div
        className="responsive-navigation-panel"
        data-open={open}
        id={panelId}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
        }}
      >
        {displayName ? (
          <div className="mobile-navigation-profile">
            <span className="profile-card-avatar" aria-hidden="true">{initial}</span>
            <div>
              <strong>{displayName}</strong>
              {roleLabel ? <span>{roleLabel}</span> : null}
              {email ? <span className="mobile-navigation-email">{email}</span> : null}
            </div>
          </div>
        ) : null}
        {children}
        <div className="mobile-navigation-account">{mobileAccount}</div>
      </div>
    </div>
  );
}

const workspaceIcons: Record<string, UiIconName> = {
  "/": "home",
  "/browse": "browse",
  "/owner": "dashboard",
  "/admin": "dashboard",
  "/admin/reviews": "reviews",
  "/admin/reports": "reports",
};

export function WorkspaceNavigationLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href === "/owner" && pathname.startsWith("/owner/")) || (href === "/admin" && pathname.startsWith("/admin/listings/")) || (href !== "/" && href !== "/owner" && href !== "/admin" && pathname.startsWith(href + "/"));
  return <Link aria-current={active ? "page" : undefined} href={href}><UiIcon className="ui-icon" name={workspaceIcons[href] ?? "account"} /><span>{label}</span></Link>;
}
