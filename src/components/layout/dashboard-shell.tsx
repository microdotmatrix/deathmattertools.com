"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher, SignedIn } from "@clerk/nextjs";

type DashboardShellProps = {
  children: ReactNode;
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
};

const sidebarLinks: SidebarLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    label: "Feedback",
    href: "/dashboard/feedback",
    icon: "mdi:message-text-outline",
  },
  {
    label: "Feedback Surveys",
    href: "/dashboard/feedback-surveys",
    icon: "mdi:clipboard-text-outline",
    disabled: true,
  },
  {
    label: "User Settings",
    href: "/dashboard/settings",
    icon: "mdi:cog-outline",
    disabled: true,
  },
  {
    label: "Organization Preferences",
    href: "/dashboard/organization",
    icon: "mdi:account-group-outline",
    disabled: true,
  },
];

export const DashboardShell = ({ children }: DashboardShellProps) => {
  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset className="bg-transparent">
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
          <SidebarTrigger className="mt-1" />
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

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="pt-6">
        <SignedIn>
          <div className="mt-4 px-2">
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: "w-full justify-between",
                },
              }}
            />
          </div>
        </SignedIn>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarLinks.map((item) => {
              const isActive =
                !item.disabled &&
                (pathname === item.href || pathname.startsWith(`${item.href}/`));

              const buttonLabel = (
                <span className="flex items-center gap-2">
                  <Icon icon={item.icon} className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
              );

              return (
                <SidebarMenuItem key={item.label}>
                  {item.disabled ? (
                    <>
                      <SidebarMenuButton
                        aria-disabled="true"
                        className="pointer-events-none opacity-60"
                        tooltip="Coming soon"
                      >
                        {buttonLabel}
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Soon
                      </SidebarMenuBadge>
                    </>
                  ) : (
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} className="flex items-center gap-2">
                        {buttonLabel}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="rounded-lg border border-dashed border-sidebar-border/80 px-3 py-2 text-xs text-muted-foreground">
          Toggle sidebar with <span className="font-semibold text-foreground">⌘/Ctrl + B</span>
        </div>
      </SidebarFooter>
    </>
  );
};
