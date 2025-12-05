import { AuthLayout } from "@/components/auth/layout";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

function SignInFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<SignInFallback />}>
        <SignIn />
      </Suspense>
    </AuthLayout>
  );
}
