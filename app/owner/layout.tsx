import type { ReactNode } from "react";
import { WorkspaceHeader } from "../../src/components/workspace-header";

export default function OwnerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <><WorkspaceHeader links={[
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Dashboard", href: "/owner" },
    { label: "Add property", href: "/owner/listings/new" },
  ]} />{children}</>;
}
