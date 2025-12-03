import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { UserSettingsForm } from "@/components/settings/user-settings-form";
import { getUserSettings } from "@/lib/db/queries/user-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const userSettings = await getUserSettings();

  return (
    <DashboardShell>
      <DashboardHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />
      <div className="space-y-6">
        <UserSettingsForm initialSettings={userSettings} />
      </div>
    </DashboardShell>
  );
}