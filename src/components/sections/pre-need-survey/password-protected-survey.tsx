"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/elements/form/animated-input";
import { verifySurveyPasswordAction } from "@/actions/pre-need-survey";
import { toast } from "sonner";

interface PasswordProtectedSurveyProps {
  token: string;
  subjectName: string;
}

export function PasswordProtectedSurvey({
  token,
  subjectName,
}: PasswordProtectedSurveyProps) {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("password", password);

    startTransition(async () => {
      const result = await verifySurveyPasswordAction(token, {}, formData);

      if (result.error) {
        toast.error(result.error);
        setPassword("");
      } else if (result.success) {
        // Reload the page to access the survey
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-2">Password Required</h1>
          <p className="text-muted-foreground">
            This survey for <strong>{subjectName}</strong> is password
            protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatedInput
            label="Password"
            name="password"
            type="password"
            controlled={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !password}
          >
            {isPending ? "Verifying..." : "Access Survey"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have the password? Contact the person who sent you this link.
        </p>
      </div>
    </div>
  );
}
