"use client";

import { submitFeedbackAction } from "@/actions/system-feedback-actions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureScreenshot, compressBase64Image } from "@/lib/utils/screenshot";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ErrorReportFormProps {
  onSuccess?: () => void;
}

export const ErrorReportForm = ({ onSuccess }: ErrorReportFormProps) => {
  const { userId, isSignedIn } = useAuth();
  const pathname = usePathname();
  
  const [module, setModule] = useState(pathname || "");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("");
  const [email, setEmail] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!module.trim()) {
      toast.error("Please specify where the error occurred");
      return;
    }

    if (!description.trim()) {
      toast.error("Please describe what happened");
      return;
    }

    if (!action.trim()) {
      toast.error("Please describe what you were trying to do");
      return;
    }

    startTransition(async () => {
      // Capture automatic context
      const metadata: Record<string, unknown> = {
        url: window.location.href,
        pathname: pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        referrer: document.referrer || null,
        module: module,
        platform: "web",
        hasScreenshot: !!screenshot,
      };

      // Include email in metadata if not authenticated
      if (!isSignedIn && email) {
        metadata.email = email;
      }

      // Include screenshot in metadata if captured
      if (screenshot) {
        metadata.screenshot = screenshot;
      }

      const result = await submitFeedbackAction({
        type: "bug",
        source: "error_reporter",
        userId: userId || undefined,
        subject: `Error: ${module}`,
        message: `**What happened:**\n${description}\n\n**What I was trying to do:**\n${action}`,
        metadata,
      });

      if (result.success) {
        toast.success("Error report submitted", {
          description: "Thank you for helping us improve!",
        });
        
        // Reset form
        setModule(pathname || "");
        setDescription("");
        setAction("");
        setEmail("");
        setScreenshot(null);
        
        onSuccess?.();
      } else {
        toast.error("Failed to submit error report", {
          description: result.error || "Please try again later",
        });
      }
    });
  };

  const handleCaptureScreenshot = async () => {
    setIsCapturing(true);
    try {
      const captured = await captureScreenshot({ quality: 0.7, maxWidth: 1920, maxHeight: 1080 });
      if (captured) {
        // Compress further if needed
        const compressed = await compressBase64Image(captured, 500);
        setScreenshot(compressed);
        toast.success("Screenshot captured");
      } else {
        toast.error("Failed to capture screenshot");
      }
    } catch (error) {
      console.error("Screenshot capture error:", error);
      toast.error("Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="module">Module / Location *</Label>
        <Input
          id="module"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          placeholder="e.g., Dashboard, Entry Editor, Settings"
          disabled={isPending}
          required
        />
        <p className="text-xs text-muted-foreground">
          Where did you encounter this error?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What happened? *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the error or unexpected behavior..."
          disabled={isPending}
          required
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/1000 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="action">What were you trying to do? *</Label>
        <Textarea
          id="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="What action were you performing when this occurred?"
          disabled={isPending}
          required
          className="min-h-[60px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {action.length}/500 characters
        </p>
      </div>

      {!isSignedIn && (
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            We'll use this to follow up if needed
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Screenshot (optional)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCaptureScreenshot}
            disabled={isPending || isCapturing}
            className="flex items-center gap-2"
          >
            <Icon icon="mdi:camera" className="size-4" />
            {isCapturing ? "Capturing..." : screenshot ? "Retake Screenshot" : "Capture Screenshot"}
          </Button>
          {screenshot && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setScreenshot(null)}
              disabled={isPending}
            >
              <Icon icon="mdi:close" className="size-4" />
            </Button>
          )}
        </div>
        {screenshot && (
          <div className="relative mt-2 rounded-lg border border-border overflow-hidden">
            <img
              src={screenshot}
              alt="Screenshot preview"
              className="w-full h-auto max-h-[200px] object-contain"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Help us understand the issue better with a screenshot
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Submitting..." : "Report Error"}
      </Button>
    </form>
  );
};
