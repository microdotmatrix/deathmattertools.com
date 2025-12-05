import { Suspense } from "react";

/**
 * Auth layout - wraps auth pages in Suspense for cacheComponents compatibility
 * Clerk components access cookies which must be in a Suspense boundary
 */
export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
