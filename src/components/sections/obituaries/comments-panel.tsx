"use client";

import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  updateCommentStatusAction,
} from "@/actions/comments";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import {
  expandChatBubbleAtom,
  isEditingObituaryAtom,
  prefilledChatMessageAtom,
} from "@/lib/state";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  formatBulkCommentsForChatMessage,
  formatCommentForChatMessage,
} from "@/lib/ai/comment-formatter";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { CommentContent } from "./comment-content";

type SerializableComment = {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "denied" | "resolved";
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;
  // Anchor fields for text-anchored comments
  anchorStart?: number | null;
  anchorEnd?: number | null;
  anchorText?: string | null;
  anchorPrefix?: string | null;
  anchorSuffix?: string | null;
  anchorValid?: boolean | null;
  anchorStatus?: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
};

type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

interface ObituaryCommentsProps {
  documentId: string;
  canComment: boolean;
  canModerate: boolean;
  currentUser: CurrentUser;
  initialComments: SerializableComment[];
}

type CommentNode = SerializableComment & {
  replies: CommentNode[];
};

const buildCommentTree = (comments: SerializableComment[]) => {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )
    .forEach((comment) => {
      nodes.set(comment.id, { ...comment, replies: [] });
    });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const normalizeComment = (
  comment: any,
  author: SerializableComment["author"]
): SerializableComment => ({
  id: comment.id,
  userId: comment.userId,
  content: comment.content,
  parentId: comment.parentId ?? null,
  createdAt:
    typeof comment.createdAt === "string"
      ? comment.createdAt
      : new Date(comment.createdAt).toISOString(),
  updatedAt:
    typeof comment.updatedAt === "string"
      ? comment.updatedAt
      : new Date(comment.updatedAt).toISOString(),
  status: comment.status ?? "pending",
  statusChangedAt: comment.statusChangedAt
    ? typeof comment.statusChangedAt === "string"
      ? comment.statusChangedAt
      : new Date(comment.statusChangedAt).toISOString()
    : null,
  statusChangedBy: comment.statusChangedBy ?? null,
  author,
});

const COMMENT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50/60 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  },
  approved: {
    label: "Approved",
    className: "border-green-200 bg-green-50/60 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200",
  },
  denied: {
    label: "Denied",
    className: "border-red-200 bg-red-50/60 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
  },
  resolved: {
    label: "Resolved",
    className: "border-muted bg-muted/50 text-muted-foreground",
  },
};

const initials = (name?: string | null) => {
  if (!name) return "U";
  const pieces = name.trim().split(" ");
  if (pieces.length === 1) {
    return pieces[0]!.slice(0, 2).toUpperCase();
  }
  return `${pieces[0]![0] ?? ""}${pieces[pieces.length - 1]![0] ?? ""}`.toUpperCase();
};

export const ObituaryComments = ({
  documentId,
  canComment,
  canModerate,
  currentUser,
  initialComments,
}: ObituaryCommentsProps) => {
  const [comments, setComments] = useState<SerializableComment[]>(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic<
    SerializableComment[],
    SerializableComment
  >(comments, (state, newComment) => [...state, newComment]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editingDrafts, setEditingDrafts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track collapsed comments - resolved and denied comments are collapsed by default
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(() => {
    const collapsedIds = initialComments
      .filter((c) => c.status === "resolved" || c.status === "denied")
      .map((c) => c.id);
    return new Set(collapsedIds);
  });

  // Update collapsed state when comments change (e.g., new resolved/denied comments)
  useEffect(() => {
    setCollapsedComments((prev) => {
      const newCollapsed = new Set(prev);
      // Auto-collapse newly resolved or denied comments
      for (const comment of comments) {
        if ((comment.status === "resolved" || comment.status === "denied") && !prev.has(comment.id)) {
          newCollapsed.add(comment.id);
        }
      }
      return newCollapsed;
    });
  }, [comments]);

  const toggleCollapse = (commentId: string) => {
    setCollapsedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const isEditingObituary = useAtomValue(isEditingObituaryAtom);
  const setPrefilledMessage = useSetAtom(prefilledChatMessageAtom);
  const setExpandChatBubble = useSetAtom(expandChatBubbleAtom);

  // Handle applying a comment with AI assistant
  const handleApplyWithAI = (comment: SerializableComment) => {
    const message = formatCommentForChatMessage({
      content: comment.content,
      authorName: comment.author.name ?? "Anonymous",
      anchorText: comment.anchorText,
    });
    setPrefilledMessage({ message, commentId: comment.id });
    setExpandChatBubble(true);
  };

  // Compute approved comments for bulk apply
  const approvedComments = useMemo(
    () => comments.filter((c) => c.status === "approved" && !c.parentId),
    [comments]
  );

  // Handle applying all approved comments with AI assistant
  const handleApplyAllWithAI = () => {
    if (approvedComments.length === 0) return;

    const formattedComments = approvedComments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.author.name ?? "Anonymous",
      anchorText: c.anchorText,
    }));

    const message = formatBulkCommentsForChatMessage(formattedComments);
    setPrefilledMessage({ message });
    setExpandChatBubble(true);
  };

  const commentTree = useMemo(
    () => buildCommentTree(optimisticComments),
    [optimisticComments]
  );

  const resetStates = () => {
    setNewComment("");
    setReplyDrafts({});
    setEditingDrafts({});
    setEditingId(null);
    setReplyingTo(null);
  };

  const handleCreate = async (parentId?: string | null) => {
    const content =
      parentId == null
        ? newComment.trim()
        : (replyDrafts[parentId] ?? "").trim();

    if (!content) {
      toast.error("Comment cannot be empty.");
      return;
    }

    const optimisticComment: SerializableComment = {
      id: `temp-${Date.now()}`,
      userId: currentUser.id,
      content,
      parentId: parentId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      statusChangedAt: null,
      statusChangedBy: null,
      author: currentUser,
    };

    startTransition(async () => {
      addOptimisticComment(optimisticComment);

      const formData = new FormData();
      formData.append("content", content);
      if (parentId) {
        formData.append("parentId", parentId);
      }

      const result = await createCommentAction(documentId, {}, formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.comment) {
        const comment = normalizeComment(result.comment, currentUser);
        setComments((prev) => [...prev, comment]);
        
        if (parentId) {
          setReplyDrafts((drafts) => ({
            ...drafts,
            [parentId]: "",
          }));
          setReplyingTo(null);
        } else {
          setNewComment("");
        }
        toast.success("Comment added");
      }
    });
  };

  const handleUpdate = async (commentId: string) => {
    const content = (editingDrafts[commentId] ?? "").trim();

    if (!content) {
      toast.error("Comment cannot be empty.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("content", content);

      const result = await updateCommentAction(documentId, commentId, {}, formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.comment) {
        setComments((prev) =>
          prev.map((item) =>
            item.id === commentId
              ? {
                  ...item,
                  content: result.comment.content,
                  updatedAt:
                    typeof result.comment.updatedAt === "string"
                      ? result.comment.updatedAt
                      : new Date(result.comment.updatedAt).toISOString(),
                }
              : item
          )
        );
        setEditingId(null);
        setEditingDrafts((drafts) => ({
          ...drafts,
          [commentId]: "",
        }));
        toast.success("Comment updated");
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    startTransition(async () => {
      const result = await deleteCommentAction(documentId, commentId);

      if (result.error) {
        toast.error(result.error);
      } else {
        setComments((prev) => {
          const idsToRemove = new Set<string>();
          const stack = [commentId];

          while (stack.length > 0) {
            const current = stack.pop()!;
            if (idsToRemove.has(current)) continue;
            idsToRemove.add(current);
            prev
              .filter((item) => item.parentId === current)
              .forEach((child) => stack.push(child.id));
          }

          return prev.filter((comment) => !idsToRemove.has(comment.id));
        });
        toast.success("Comment removed");
      }
    });
  };

  const canEdit = (comment: SerializableComment) =>
    comment.status === "pending" &&
    (comment.userId === currentUser.id || canModerate);

  const handleStatusUpdate = async (
    commentId: string,
    status: "approved" | "denied" | "resolved"
  ) => {
    startTransition(async () => {
      const result = await updateCommentStatusAction(documentId, commentId, status);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.comment) {
        setComments((prev) =>
          prev.map((item) =>
            item.id === commentId
              ? {
                  ...item,
                  status: result.comment.status,
                  statusChangedAt: result.comment.statusChangedAt
                    ? typeof result.comment.statusChangedAt === "string"
                      ? result.comment.statusChangedAt
                      : new Date(result.comment.statusChangedAt).toISOString()
                    : null,
                  statusChangedBy: result.comment.statusChangedBy ?? null,
                  updatedAt:
                    typeof result.comment.updatedAt === "string"
                      ? result.comment.updatedAt
                      : new Date(result.comment.updatedAt).toISOString(),
                }
              : item
          )
        );
        toast.success(
          status === "approved"
            ? "Comment approved"
            : status === "denied"
            ? "Comment denied"
            : "Comment resolved"
        );
      }
    });
  };

  const renderComment = (node: CommentNode, depth = 0) => {
    // const isAuthor = node.userId === currentUser.id;
    const isEditing = editingId === node.id;
    const isReplying = replyingTo === node.id;
    const isCollapsed = collapsedComments.has(node.id);
    const statusConfig = COMMENT_STATUS_CONFIG[node.status];

    return (
      <div key={node.id} className="space-y-3">
        <div
          className={cn(
            "rounded-lg border border-border/50 bg-card/40",
            depth > 0 && "bg-muted/40",
            isCollapsed ? "p-3" : "p-4"
          )}
        >
          <div className="flex items-start gap-3">
            {!isCollapsed && (
              <Avatar className="mt-1 size-9 flex-shrink-0">
                {node.author.imageUrl ? (
                  <AvatarImage src={node.author.imageUrl} />
                ) : (
                  <AvatarFallback>
                    {initials(node.author.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {node.author.name ?? node.author.email ?? "Unknown user"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(node.createdAt))}
                  </span>
                  {statusConfig && (
                    <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
                      {statusConfig.label}
                    </Badge>
                  )}
                  {isCollapsed && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      — {node.content.slice(0, 50)}{node.content.length > 50 ? "..." : ""}
                    </span>
                  )}
                </div>
                {/* Collapse/Expand toggle button */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(node.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
                >
                  <Icon
                    icon={isCollapsed ? "mdi:chevron-down" : "mdi:chevron-up"}
                    className="size-4"
                  />
                </button>
              </div>
              {!isCollapsed && (
                <>
                  {isEditing ? (
                    <div className="space-y-2 mt-3">
                      <Textarea
                        value={editingDrafts[node.id] ?? ""}
                        onChange={(event) =>
                          setEditingDrafts((drafts) => ({
                            ...drafts,
                            [node.id]: event.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(node.id)}
                          disabled={isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditingDrafts((drafts) => ({
                              ...drafts,
                              [node.id]: "",
                            }));
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <CommentContent content={node.content} />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground mt-3">
                {/* Left group: Edited indicator, Reply, Edit, Delete */}
                <div className="flex flex-wrap items-center gap-2">
                  {new Date(node.updatedAt).getTime() -
                    new Date(node.createdAt).getTime() >
                    60 * 1000 && <span>Edited</span>}
                  {canComment && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                      onClick={() => {
                        setReplyingTo(
                          isReplying ? null : node.id
                        );
                      }}
                    >
                      <Icon icon="lucide:corner-down-right" className="size-3" />
                      Reply
                    </button>
                  )}
                  {canEdit(node) && (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                        onClick={() => {
                          setEditingId(node.id);
                          setEditingDrafts((drafts) => ({
                            ...drafts,
                            [node.id]: node.content,
                          }));
                        }}
                      >
                        <Icon icon="lucide:pencil" className="size-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(node.id)}
                        disabled={isPending}
                      >
                        <Icon icon="lucide:trash-2" className="size-3" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
                {/* Right group: Approve, Deny, Resolve */}
                <div className="flex flex-wrap items-center gap-2">
                  {canModerate && node.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                        onClick={() => handleStatusUpdate(node.id, "approved")}
                        disabled={isPending}
                      >
                        <Icon icon="mdi:check-circle" className="size-3" />
                        Approve
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80"
                        onClick={() => handleStatusUpdate(node.id, "denied")}
                        disabled={isPending}
                      >
                        <Icon icon="mdi:close-circle" className="size-3" />
                        Deny
                      </button>
                    </>
                  )}
                  {canModerate && node.status === "approved" && (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                        onClick={() => handleApplyWithAI(node)}
                        disabled={isPending}
                        title="Open AI assistant with this comment"
                      >
                        <Icon icon="mdi:sparkles" className="size-3" />
                        Apply with AI
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-foreground hover:text-primary"
                        onClick={() => handleStatusUpdate(node.id, "resolved")}
                        disabled={isPending}
                      >
                        <Icon icon="mdi:check" className="size-3" />
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isReplying && (
                <div className="space-y-2">
                  <Textarea
                    placeholder={`Reply to ${node.author.name ?? "comment"}`}
                    value={replyDrafts[node.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((drafts) => ({
                        ...drafts,
                        [node.id]: event.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreate(node.id)}
                      disabled={isPending}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
        {node.replies.length > 0 && (
          <div className="border-l border-border/50 pl-6 space-y-3">
            {node.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
        <div className="flex items-center gap-2">
          {canModerate && approvedComments.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyAllWithAI}
              className="text-xs"
            >
              <Icon icon="mdi:sparkles" className="mr-1 size-3" />
              Apply {approvedComments.length} with AI
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetStates}
            className="text-xs"
          >
            Reset
          </Button>
        </div>
      </div>
      {canComment ? (
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts or feedback..."
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={4}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => handleCreate(null)}
              disabled={isPending || isEditingObituary}
              title={isEditingObituary ? "Save your edits before posting comments" : undefined}
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
          Organization commenting is currently disabled. Contact the document
          owner if you need to contribute.
        </p>
      )}
      <div className="space-y-6">
        {commentTree.length > 0 ? (
          commentTree.map((comment) => renderComment(comment))
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border/40 bg-muted/20 py-10 text-center text-sm text-muted-foreground">
            <Icon icon="lucide:message-circle" className="size-6 opacity-80" />
            <p>No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};
