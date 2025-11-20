import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsPage() {
    return (
      <DashboardShell>
        <DashboardHeader
          title="Settings"
          description="Manage your account settings and preferences."
        />
        <div className="space-y-6">
          <h2>Settings</h2>
        </div>
      </DashboardShell>
    );
}