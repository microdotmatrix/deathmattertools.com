"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { CommentAnchorBadge } from "./comment-anchor-badge";
import { AnchorModerationActions } from "./anchor-moderation-actions";
import type { AnchorStatus } from "@/lib/db/schema";

interface EnhancedCommentCardProps {
  comment: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    anchorStart?: number | null;
    anchorEnd?: number | null;
    anchorText?: string | null;
    anchorValid?: boolean;
    anchorStatus?: string | null;
    author: {
      id: string;
      name: string | null;
      email: string | null;
      imageUrl: string | null;
    };
  };
  currentUserId: string;
  canModerate: boolean;
  documentId: string;
  onGoToAnchor?: () => void;
  onStatusChange?: () => void;
  children?: React.ReactNode;
}

const initials = (name?: string | null) => {
  if (!name) return "U";
  const pieces = name.trim().split(" ");
  if (pieces.length === 1) {
    return pieces[0]!.slice(0, 2).toUpperCase();
  }
  return `${pieces[0]![0] ?? ""}${pieces[pieces.length - 1]![0] ?? ""}`.toUpperCase();
};

export const EnhancedCommentCard = ({
  comment,
  currentUserId,
  canModerate,
  documentId,
  onGoToAnchor,
  onStatusChange,
  children,
}: EnhancedCommentCardProps) => {
  const isAuthor = comment.userId === currentUserId;
  const hasAnchor = comment.anchorStart != null && comment.anchorEnd != null && comment.anchorText;
  const anchorStatus = (comment.anchorStatus || "pending") as AnchorStatus;

  return (
    <div className="rounded-lg border border-border/50 bg-card/40 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="mt-1 size-9">
          {comment.author.imageUrl ? (
            <AvatarImage src={comment.author.imageUrl} />
          ) : (
            <AvatarFallback>
              {initials(comment.author.name)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {comment.author.name ?? comment.author.email ?? "Unknown user"}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
            {isAuthor && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
          </div>
          
          {/* Anchor badge */}
          {hasAnchor && (
            <CommentAnchorBadge
              anchorText={comment.anchorText!}
              status={anchorStatus}
              valid={comment.anchorValid ?? true}
              onGoToAnchor={onGoToAnchor}
            />
          )}
          
          {/* Content */}
          <p className="text-sm whitespace-pre-line">
            {comment.content}
          </p>
          
          {/* Edited indicator */}
          {new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 60 * 1000 && (
            <span className="text-xs text-muted-foreground">Edited</span>
          )}
          
          {/* Moderation actions (owner only, anchored comments only) */}
          {canModerate && hasAnchor && (
            <AnchorModerationActions
              documentId={documentId}
              commentId={comment.id}
              currentStatus={anchorStatus}
              onStatusChange={onStatusChange}
            />
          )}
          
          {/* Custom actions (edit/delete/reply) */}
          {children}
        </div>
      </div>
    </div>
  );
};
