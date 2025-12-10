import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const NotFoundPage = () => {
  return (
    <main className="min-h-[70vh] w-full px-6 py-16 sm:py-24 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          <Icon icon="mdi:alert-circle-outline" className="size-4" />
          <span>Page not found</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            We could not find what you were looking for.
          </h1>
          <p className="text-muted-foreground">
            The page might have moved or no longer exists. Double-check the URL
            or head back to your dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <Icon icon="mdi:view-dashboard-outline" className="size-5" />
            Go to dashboard
          </Link>
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
  );
};

export default NotFoundPage;
