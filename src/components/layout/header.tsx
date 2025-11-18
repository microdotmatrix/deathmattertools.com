"use client";

import { ThemeToggle } from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMounted } from "@/hooks/use-mounted";
import { navigationLinks } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const { isLoaded } = useUser();
  const mounted = useMounted();
  return (
    <header className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/90 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <Icon icon="ph:skull-duotone" className="size-5" />
        </Link>

        {/* Mobile nav trigger */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="md:hidden" variant="ghost" size="icon">
              <Icon icon="mdi:menu" className="size-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {navigationLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (pathname.startsWith(`${link.href}/`) && link.href !== "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-primary",
                      isActive && "text-primary"
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </PopoverContent>
        </Popover>

        <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
          {navigationLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname.startsWith(`${link.href}/`) && link.href !== "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-muted-foreground transition hover:text-primary",
                  isActive && "text-primary"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {mounted && (
          <div className="flex items-center gap-2">
            {isLoaded && (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="icon">
                      <Icon icon="carbon:user-avatar" className="size-5" />
                      <span className="sr-only">Sign in</span>
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton userProfileMode="modal" />
                </SignedIn>
              </>
            )}
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
};
