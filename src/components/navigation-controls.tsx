"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function ResponsiveNavigation({ children, className = "" }: { children: ReactNode; className?: string }) {
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

  return <div className={"responsive-navigation " + className} ref={rootRef}>
    <button aria-controls={panelId} aria-expanded={open} aria-label={open ? "Close navigation menu" : "Open navigation menu"} className="responsive-navigation-toggle" onClick={() => setOpen((value) => !value)} ref={toggleRef} type="button">
      <span>{open ? "Close" : "Menu"}</span>
    </button>
    <div className="responsive-navigation-panel" data-open={open} id={panelId} onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) setOpen(false); }}>{children}</div>
  </div>;
}

export function WorkspaceNavigationLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href === "/owner" && pathname.startsWith("/owner/")) || (href === "/admin" && pathname.startsWith("/admin/listings/")) || (href !== "/" && href !== "/owner" && href !== "/admin" && pathname.startsWith(href + "/"));
  return <Link aria-current={active ? "page" : undefined} href={href}>{label}</Link>;
}
