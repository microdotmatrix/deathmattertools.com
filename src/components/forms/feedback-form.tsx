"use client";

import { submitFeedbackAction } from "@/actions/system-feedback-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface FeedbackFormProps {
  type: "contact" | "feature_request" | "bug" | "other";
  source: string;
  entryId?: string;
  onSuccess?: () => void;
  showSubject?: boolean;
  subjectPlaceholder?: string;
  messagePlaceholder?: string;
  submitButtonText?: string;
}

export const FeedbackForm = ({
  type,
  source,
  entryId,
  onSuccess,
  showSubject = true,
  subjectPlaceholder = "Brief summary",
  messagePlaceholder = "Please provide details...",
  submitButtonText = "Submit Feedback",
}: FeedbackFormProps) => {
  const { userId } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (showSubject && !subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    startTransition(async () => {
      const metadata: Record<string, unknown> = {
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      };

      // Include email in metadata if not authenticated
      if (!userId && email) {
        metadata.email = email;
      }

      const result = await submitFeedbackAction({
        type,
        source,
        userId: userId || undefined,
        entryId: entryId || undefined,
        subject: showSubject ? subject : `${type} from ${source}`,
        message,
        metadata,
      });

      if (result.success) {
        toast.success("Feedback submitted successfully", {
          description: "Thank you for your feedback!",
        });
        setSubject("");
        setMessage("");
        setEmail("");
        onSuccess?.();
      } else {
        toast.error("Failed to submit feedback", {
          description: result.error || "Please try again later",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showSubject && (
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={subjectPlaceholder}
            disabled={isPending}
            required
            className="mt-2"
          />
        </div>
      )}

      {!userId && (
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isPending}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We'll use this to follow up if needed
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messagePlaceholder}
          disabled={isPending}
          required
          className="mt-2 min-h-32"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting..." : submitButtonText}
      </Button>
    </form>
  );
};
