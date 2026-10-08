import type { ReactNode } from "react";
import { WorkspaceHeader } from "../../src/components/workspace-header";

export default function OwnerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <><WorkspaceHeader links={[
    { label: "Dashboard", href: "/owner" },
    { label: "Add property", href: "/owner/listings/new" },
    { label: "Browse", href: "/browse" },
  ]} />{children}</>;
}
