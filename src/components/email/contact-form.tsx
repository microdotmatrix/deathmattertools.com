"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { emailAction } from "@/lib/api/email";
import { ActionState } from "@/lib/utils";
import { useActionState } from "react";

export const ContactSection = () => {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    emailAction,
    {
      error: "",
      success: "",
    }
  );

  return (
    <form className="flex flex-col gap-4" action={action}>
      {state.success ? (
        <Alert className="flex-1 flex flex-col items-center justify-center">
          <Icon icon="lucide:check" className="size-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : (
        <>
          <AnimatedInput
            name="name"
            label="Name"
            type="text"
            placeholder="Your name"
            defaultValue={state.name}
          />
          <AnimatedInput
            name="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            defaultValue={state.email}
          />
          <AnimatedInput
            name="message"
            label="Message"
            type="textarea"
            placeholder="Your message..."
            className="min-h-32"
            defaultValue={state.message}
          />
          <div className="flex items-center gap-1">
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? (
                <Icon
                  icon="ph:spinner-gap"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              ) : (
                <Icon icon="lucide:send" className="mr-2 h-4 w-4" />
              )}
              Send Message
            </Button>
            <Button variant="outline" type="reset" className="flex-1">
              Cancel
            </Button>
          </div>
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