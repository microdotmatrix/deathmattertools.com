"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen w-full px-6 py-16 sm:py-24 flex items-center justify-center bg-background">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive shadow-sm">
              <Icon icon="mdi:skull-outline" className="size-4" />
              <span>Unexpected error</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Our servers stumbled. We are on it.
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try again, and if it
                persists we will investigate.
              </p>
              {error.digest ? (
                <p className="text-xs text-muted-foreground/80">
                  Error reference: {error.digest}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                <Icon icon="mdi:refresh" className="size-5" />
                Try again
              </button>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto"
                )}
              >
                <Icon icon="mdi:home-outline" className="size-5" />
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
