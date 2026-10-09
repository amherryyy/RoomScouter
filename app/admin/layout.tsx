import type { ReactNode } from "react";
import { WorkspaceHeader } from "../../src/components/workspace-header";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <><WorkspaceHeader links={[
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Dashboard", href: "/admin" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
  ]} />{children}</>;
}
