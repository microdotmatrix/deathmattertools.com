import { auth } from "@clerk/nextjs/server";
import { type ReactNode } from "react";

import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: ReactNode;
  sidebarContent?: ReactNode;
};

type DashboardHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
};

type SidebarLink = {
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
  matchSubRoutes?: boolean;
};

const workspaceLinks: SidebarLink[] = [
  {
    label: "Entries",
    href: "/dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    label: "User Settings",
    href: "/dashboard/settings",
    icon: "mdi:cog-outline",
  },
  {
    label: "Organization",
    href: "/dashboard/organization",
    icon: "mdi:account-group-outline",
  },
];

const adminLinks: SidebarLink[] = [
  {
    label: "Feedback",
    href: "/dashboard/feedback",
    icon: "mdi:message-text-outline",
    matchSubRoutes: true,
  },
];

export const DashboardShell = ({ children, sidebarContent }: DashboardShellProps) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "28rem",
          "--sidebar-width-mobile": "24rem"
        } as React.CSSProperties
      }
    >
      <Sidebar>
        <DashboardSidebar extraContent={sidebarContent} />
      </Sidebar>
      <SidebarInset className="bg-transparent">
        <div className="fixed top-3 left-4 z-100 flex flex-row items-center gap-2 group">
          <SidebarTrigger className="group-has-data-[collapsible=offcanvas]/sidebar-wrapper:left-4 size-8 hover:text-primary group-hover:text-primary" size="lg" variant="ghost" />
          <span className="text-xs lg:opacity-0 lg:translate-x-4 transition-all duration-200 ease-linear group-hover:opacity-100 group-hover:translate-x-0">Menu</span>
        </div>
        <div className="flex min-h-svh flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-6 md:px-8 lg:px-10">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const DashboardHeader = ({
  title,
  description,
  actions,
  eyebrow = "Workspace",
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const DashboardSidebar = async ({
  extraContent,
}: {
  extraContent?: ReactNode;
}) => {
  const { userId } = await auth();
  const clerkClientInstance = await (await import("@clerk/nextjs/server")).clerkClient();
  const user = userId ? await clerkClientInstance.users.getUser(userId) : null;
  const isSystemAdmin = user?.publicMetadata?.role === "system_admin";

  return (
    <>
      <SidebarHeader className="pt-12" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <DashboardSidebarNav links={workspaceLinks} />
        </SidebarGroup>
        {isSystemAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <DashboardSidebarNav links={adminLinks} />
          </SidebarGroup>
        )}
        {extraContent}
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
        <div className="rounded-lg border border-dashed border-sidebar-border/80 px-3 py-2 text-xs text-muted-foreground">
          Toggle sidebar with <span className="font-semibold text-foreground">⌘/Ctrl + B</span>
        </div>
      </SidebarFooter>
    </>
  );
};
