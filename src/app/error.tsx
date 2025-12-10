"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log client-side so we can surface unexpected issues
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] w-full px-6 py-16 sm:py-24 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive shadow-sm">
          <Icon icon="mdi:alert-octagon-outline" className="size-4" />
          <span>Something went wrong</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            We hit a snag while loading this page.
          </h1>
          <p className="text-muted-foreground">
            Please try again. If the issue keeps happening, our team will look
            into it.
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
          <a
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto"
            )}
          >
            <Icon icon="mdi:home-outline" className="size-5" />
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
