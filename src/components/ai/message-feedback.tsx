"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface MessageFeedbackProps {
  messageId: string;
  chatId: string;
  currentVote?: boolean | null; // true = upvote, false = downvote, null = no vote
  onVoteChange?: (isUpvoted: boolean | null) => void;
}

export const MessageFeedback = ({
  messageId,
  chatId,
  currentVote: initialVote,
  onVoteChange,
}: MessageFeedbackProps) => {
  const [currentVote, setCurrentVote] = useState<boolean | null>(
    initialVote ?? null
  );
  const [isPending, startTransition] = useTransition();

  const handleVote = async (isUpvoted: boolean) => {
    // If clicking the same vote, remove it (toggle behavior)
    const newVote = currentVote === isUpvoted ? null : isUpvoted;

    // Optimistic update
    const previousVote = currentVote;
    setCurrentVote(newVote);
    onVoteChange?.(newVote);

    startTransition(async () => {
      try {
        if (newVote === null) {
          // Delete vote
          const response = await fetch("/api/votes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, messageId }),
          });

          if (!response.ok) {
            throw new Error("Failed to remove vote");
          }

          toast.success("Vote removed");
        } else {
          // Create or update vote
          const response = await fetch("/api/votes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, messageId, isUpvoted: newVote }),
          });

          if (!response.ok) {
            throw new Error("Failed to save vote");
          }

          toast.success(newVote ? "Helpful!" : "Thanks for the feedback");
        }
      } catch (error) {
        // Revert optimistic update on error
        setCurrentVote(previousVote);
        onVoteChange?.(previousVote);
        
        console.error("Error voting:", error);
        toast.error("Failed to save your vote. Please try again.");
      }
    });
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote(true)}
            disabled={isPending}
            className={cn(
              "size-8",
              currentVote === true && "text-green-600 hover:text-green-700"
            )}
            aria-label="Helpful"
          >
            <ThumbsUp
              className={cn(
                "size-4",
                currentVote === true && "fill-current"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentVote === true ? "Remove vote" : "Helpful"}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote(false)}
            disabled={isPending}
            className={cn(
              "size-8",
              currentVote === false && "text-red-600 hover:text-red-700"
            )}
            aria-label="Not helpful"
          >
            <ThumbsDown
              className={cn(
                "size-4",
                currentVote === false && "fill-current"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{currentVote === false ? "Remove vote" : "Not helpful"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
