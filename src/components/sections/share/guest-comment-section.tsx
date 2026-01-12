"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  registerGuestIdentityAction,
  createGuestCommentAction,
  clearGuestIdentityAction,
} from "@/actions/guest-comments";

interface GuestIdentity {
  id: string;
  name: string;
  email: string;
}

interface GuestCommentSectionProps {
  shareLinkToken: string;
  documentId: string;
  initialGuestIdentity: GuestIdentity | null;
}

export function GuestCommentSection({
  shareLinkToken,
  documentId,
  initialGuestIdentity,
}: GuestCommentSectionProps) {
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity | null>(
    initialGuestIdentity
  );
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  if (!guestIdentity) {
    return (
      <GuestIdentityForm
        shareLinkToken={shareLinkToken}
        onSuccess={setGuestIdentity}
      />
    );
  }

  if (commentSubmitted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Icon
            icon="mdi:check-circle"
            className="mx-auto mb-4 h-12 w-12 text-green-500"
          />
          <h3 className="mb-2 text-lg font-semibold">Thank You</h3>
          <p className="text-muted-foreground">
            Your comment has been submitted and will be reviewed by the family.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCommentSubmitted(false)}
          >
            Add Another Comment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <GuestCommentForm
      shareLinkToken={shareLinkToken}
      guestIdentity={guestIdentity}
      onSuccess={() => setCommentSubmitted(true)}
      onChangeIdentity={async () => {
        await clearGuestIdentityAction();
        setGuestIdentity(null);
      }}
    />
  );
}

// ============================================================================
// Guest Identity Form
// ============================================================================

function GuestIdentityForm({
  shareLinkToken,
  onSuccess,
}: {
  shareLinkToken: string;
  onSuccess: (guest: GuestIdentity) => void;
}) {
  const registerAction = registerGuestIdentityAction.bind(null, shareLinkToken);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { error?: string },
      formData: FormData
    ) => {
      const result = await registerAction(prevState, formData);
      if (result.success && result.guest) {
        onSuccess(result.guest);
      }
      return result;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="mdi:comment-plus" className="h-5 w-5" />
          Leave a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your name and email to leave a comment. Your email will not be
          publicly displayed.
        </p>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Icon
                  icon="mdi:loading"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Guest Comment Form
// ============================================================================

function GuestCommentForm({
  shareLinkToken,
  guestIdentity,
  onSuccess,
  onChangeIdentity,
}: {
  shareLinkToken: string;
  guestIdentity: GuestIdentity;
  onSuccess: () => void;
  onChangeIdentity: () => void;
}) {
  const commentAction = createGuestCommentAction.bind(null, shareLinkToken);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { error?: string },
      formData: FormData
    ) => {
      const result = await commentAction(prevState, formData);
      if (result.success) {
        onSuccess();
      }
      return result;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:comment-plus" className="h-5 w-5" />
            Leave a Comment
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Commenting as {guestIdentity.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeIdentity}
              className="h-auto p-1"
            >
              <Icon icon="mdi:account-switch" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Your Message</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share your thoughts, memories, or condolences..."
              rows={4}
              required
              disabled={isPending}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Icon
                  icon="mdi:loading"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Posting...
              </>
            ) : (
              <>
                <Icon icon="mdi:send" className="mr-2 h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Your comment will be reviewed before it appears publicly.
        </p>
      </CardContent>
    </Card>
  );
}
