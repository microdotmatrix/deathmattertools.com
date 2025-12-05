"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import {
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarLink = {
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
  matchSubRoutes?: boolean;
};

type DashboardSidebarNavProps = {
  links: SidebarLink[];
};

export const DashboardSidebarNav = ({ links }: DashboardSidebarNavProps) => {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((item) => {
        const matchesExact = pathname === item.href;
        const matchesSubRoute =
          item.matchSubRoutes && pathname.startsWith(`${item.href}/`);
        const isActive = !item.disabled && (matchesExact || matchesSubRoute);

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
  );
};
