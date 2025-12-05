import { AuthLayout } from "@/components/auth/layout";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

function SignUpFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<SignUpFallback />}>
        <SignUp />
      </Suspense>
    </AuthLayout>
  );
}
