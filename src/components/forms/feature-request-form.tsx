"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { featureRequestAction } from "@/lib/api/feedback";
import { ActionState } from "@/lib/utils";
import { useActionState } from "react";

export const FeatureRequestForm = () => {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    featureRequestAction,
    {
      error: "",
      success: "",
    }
  );

  return (
    <form className="space-y-6" action={action}>
      {state.success ? (
        <Alert className="flex-1 flex flex-col items-center justify-center">
          <Icon icon="lucide:check" className="size-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : (
        <>
          <AnimatedInput
            name="request"
            label="What should we build for you next?"
            type="textarea"
            placeholder="Let us know here!"
            className="min-h-[120px] resize-y bg-secondary/50"
            defaultValue={state.request}
            required
          />

          <AnimatedInput
            name="email"
            label="E-mail"
            type="email"
            placeholder="you@deathculture.com"
            className="bg-secondary/50"
            defaultValue={state.email}
            required
          />

          <div className="space-y-3">
            <Label>What is your role in the death and funeral process?</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-individual-myself"
                  name="roles"
                  value="individual_myself"
                />
                <Label
                  htmlFor="role-individual-myself"
                  className="font-normal text-muted-foreground"
                >
                  Individual (for myself)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-individual-others"
                  name="roles"
                  value="individual_others"
                />
                <Label
                  htmlFor="role-individual-others"
                  className="font-normal text-muted-foreground"
                >
                  Individual (for others)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-owner"
                  name="roles"
                  value="funeral_home_owner"
                />
                <Label
                  htmlFor="role-owner"
                  className="font-normal text-muted-foreground"
                >
                  Funeral Home Owner
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-manager"
                  name="roles"
                  value="funeral_home_manager"
                />
                <Label
                  htmlFor="role-manager"
                  className="font-normal text-muted-foreground"
                >
                  Funeral Home Manager
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-employee"
                  name="roles"
                  value="funeral_home_employee"
                />
                <Label
                  htmlFor="role-employee"
                  className="font-normal text-muted-foreground"
                >
                  Funeral Home Employee (Non-Manager)
                </Label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <Icon icon="ph:spinner-gap" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon icon="lucide:send" className="mr-2 h-4 w-4" />
            )}
            Submit Survey
          </Button>
        </>
      )}
      {state.error && (
        <Alert variant="destructive">
          <Icon icon="lucide:alert-circle" className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};
