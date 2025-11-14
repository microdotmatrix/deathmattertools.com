"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface MessageActionsProps {
  messageText: string;
  messageId: string;
  isLastMessage: boolean;
  onRegenerate?: () => void;
  className?: string;
}

export const MessageActions = ({
  messageText,
  messageId,
  isLastMessage,
  onRegenerate,
  className,
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success("Copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRegenerate = () => {
    if (!onRegenerate) return;

    startTransition(() => {
      onRegenerate();
      toast.info("Regenerating response...");
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
    >
      {/* Copy Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-8"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy message"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Regenerate Button - Only show on last message */}
      {isLastMessage && onRegenerate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegenerate}
              disabled={isPending}
              className={cn("size-8", isPending && "animate-spin")}
              aria-label="Regenerate response"
            >
              <RefreshCw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate response</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
