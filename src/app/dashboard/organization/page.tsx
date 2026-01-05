import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { OrganizationDetailsForm } from "@/components/organization/organization-details-form";
import { OrganizationMembersSection } from "@/components/organization/organization-members-section";
import { OrganizationSwitcherSection } from "@/components/organization/organization-switcher-section";
import { getOrganizationDetails } from "@/lib/db/queries/organization-details";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Organization",
  description: "Manage your organization settings and team members.",
};

export default async function OrganizationPage() {
  const session = await auth();

  if (!session?.userId) {
    redirect("/sign-in");
  }

  // Get organization info from Clerk
  const clerk = await clerkClient();
  let organization = null;
  let isAdmin = false;

  if (session.orgId) {
    organization = await clerk.organizations.getOrganization({
      organizationId: session.orgId,
    });
    isAdmin = session.orgRole === "org:admin" || session.orgRole === "org:system_admin";
  }

  // Get organization details from our database
  const organizationDetails = await getOrganizationDetails();

  return (
    <DashboardShell>
      <DashboardHeader
        title="Organization"
        description="Manage your organization settings, team members, and business details."
      />

      <div className="space-y-8 max-w-screen-2xl">
        {/* Organization Switcher - Always show so users can switch/create orgs */}
        <OrganizationSwitcherSection />

        {organization ? (
          <>
            {/* Organization Details Form */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Business Details</h2>
              <OrganizationDetailsForm
                initialDetails={organizationDetails}
                organizationName={organization.name}
                isAdmin={isAdmin}
              />
            </section>

            {/* Organization Members */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              <OrganizationMembersSection />
            </section>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Organization Selected</h3>
            <p className="text-muted-foreground mb-4">
              Create or join an organization to manage business details and team members.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
