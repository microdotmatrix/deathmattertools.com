"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

type SerializableComment = {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
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
  author,
});

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
  const [comments, setComments] =
    useState<SerializableComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editingDrafts, setEditingDrafts] = useState<
    Record<string, string>
  >({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const commentTree = useMemo(
    () => buildCommentTree(comments),
    [comments]
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

    try {
      if (parentId) {
        setBusyId(parentId);
      } else {
        setIsPosting(true);
      }

      const response = await fetch(
        `/api/obituaries/${documentId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, parentId }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = typeof data?.error === 'string' 
          ? data.error 
          : data?.error?.message 
          ? data.error.message 
          : "Failed to add comment";
        throw new Error(errorMessage);
      }

      const json = await response.json();
      const comment = normalizeComment(json.comment, currentUser);
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
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    } finally {
      setIsPosting(false);
      setBusyId(null);
    }
  };

  const handleUpdate = async (commentId: string) => {
    const content = (editingDrafts[commentId] ?? "").trim();

    if (!content) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setBusyId(commentId);
      const response = await fetch(
        `/api/obituaries/${documentId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = typeof data?.error === 'string' 
          ? data.error 
          : data?.error?.message 
          ? data.error.message 
          : "Failed to update comment";
        throw new Error(errorMessage);
      }

      const { comment } = await response.json();
      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId
            ? {
                ...item,
                content: comment.content,
                updatedAt:
                  typeof comment.updatedAt === "string"
                    ? comment.updatedAt
                    : new Date(comment.updatedAt).toISOString(),
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
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update comment"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setBusyId(commentId);
      const response = await fetch(
        `/api/obituaries/${documentId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = typeof data?.error === 'string' 
          ? data.error 
          : data?.error?.message 
          ? data.error.message 
          : "Failed to delete comment";
        throw new Error(errorMessage);
      }

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
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    } finally {
      setBusyId(null);
    }
  };

  const canEdit = (comment: SerializableComment) =>
    comment.userId === currentUser.id || canModerate;

  const renderComment = (node: CommentNode, depth = 0) => {
    const isAuthor = node.userId === currentUser.id;
    const isEditing = editingId === node.id;
    const isReplying = replyingTo === node.id;

    return (
      <div key={node.id} className="space-y-3">
        <div
          className={cn(
            "rounded-lg border border-border/50 bg-card/40 p-4",
            depth > 0 && "bg-muted/40"
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="mt-1 size-9">
              {node.author.imageUrl ? (
                <AvatarImage src={node.author.imageUrl} />
              ) : (
                <AvatarFallback>
                  {initials(node.author.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {node.author.name ?? node.author.email ?? "Unknown user"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(node.createdAt))}
                </span>
                {isAuthor && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
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
                      disabled={busyId === node.id}
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
                <p className="text-sm whitespace-pre-line">
                  {node.content}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                      disabled={busyId === node.id}
                    >
                      <Icon icon="lucide:trash-2" className="size-3" />
                      Delete
                    </button>
                  </>
                )}
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
                      disabled={busyId === node.id}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={resetStates}
          className="text-xs"
        >
          Reset
        </Button>
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
              disabled={isPosting}
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
