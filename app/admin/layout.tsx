import type { ReactNode } from "react";
import { WorkspaceHeader } from "../../src/components/workspace-header";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <><WorkspaceHeader links={[
    { label: "Dashboard", href: "/admin" },
    { label: "Listings", href: "/admin?state=pending" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
  ]} />{children}</>;
}
