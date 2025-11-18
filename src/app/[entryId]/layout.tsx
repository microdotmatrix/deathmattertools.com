import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReactNode } from "react";

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
