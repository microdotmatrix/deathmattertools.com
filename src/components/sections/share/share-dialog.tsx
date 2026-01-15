"use client";

import {
  createDocumentShareLinkAction,
  createImageShareLinkAction,
  deleteShareLinkAction,
  getDocumentShareLinksAction,
  getImageShareLinksAction,
} from "@/actions/share-links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface ShareLink {
  id: string;
  token: string;
  url: string;
  isEnabled: boolean;
  allowComments: boolean;
  expiresAt: Date | null;
  viewCount: number;
  createdAt: Date;
}

interface ShareDialogProps {
  type: "document" | "image";
  resourceId: string;
  entryId: string;
  resourceTitle?: string;
  trigger?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export function ShareDialog({
  type,
  resourceId,
  entryId,
  resourceTitle,
  trigger,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load existing share links when dialog opens
  useEffect(() => {
    if (open) {
      loadShareLinks();
    }
  }, [open, type, resourceId, entryId]);

  async function loadShareLinks() {
    setIsLoading(true);
    try {
      const result =
        type === "document"
          ? await getDocumentShareLinksAction(resourceId)
          : await getImageShareLinksAction(resourceId, entryId);

      if (result.success && result.shareLinks) {
        setShareLinks(result.shareLinks);
      }
    } catch (error) {
      console.error("Failed to load share links:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(shareLinkId: string) {
    const result = await deleteShareLinkAction(shareLinkId);
    if (result.success) {
      setShareLinks((prev) => prev.filter((link) => link.id !== shareLinkId));
      toast.success("Share link deleted");
    } else {
      toast.error(result.error ?? "Failed to delete share link");
    }
  }

  function handleLinkCreated(link: ShareLink) {
    setShareLinks((prev) => [link, ...prev]);
    setShowCreateForm(false);
  }

  const title = type === "document" ? "Share Obituary" : "Share Memorial Image";
  const description =
    type === "document"
      ? "Create a shareable link for this obituary. Anyone with the link can view it without logging in."
      : "Create a shareable link for this memorial image. Anyone with the link can view and download it.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Icon icon="mdi:share-variant" className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="mdi:share-variant" className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Icon
                icon="mdi:loading"
                className="h-6 w-6 animate-spin text-muted-foreground"
              />
            </div>
          ) : (
            <>
              {/* Existing Links */}
              {shareLinks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Existing Links</h4>
                  {shareLinks.map((link) => (
                    <ShareLinkItem
                      key={link.id}
                      link={link}
                      onDelete={() => handleDelete(link.id)}
                    />
                  ))}
                </div>
              )}

              {/* Create New Link Form */}
              {showCreateForm ? (
                <CreateShareLinkForm
                  type={type}
                  resourceId={resourceId}
                  entryId={entryId}
                  onSuccess={handleLinkCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
                  Create New Share Link
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Share Link Item
// ============================================================================

function ShareLinkItem({
  link,
  onDelete,
}: {
  link: ShareLink;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  }

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div
      className={`rounded-lg border p-3 ${isExpired || !link.isEnabled ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* URL */}
          <div className="flex items-center gap-2">
            <code className="min-w-0 w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs max-w-[55ch]">
              {link.url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={copyToClipboard}
            >
              <Icon
                icon={copied ? "mdi:check" : "mdi:content-copy"}
                className="h-4 w-4"
              />
            </Button>
             {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Icon icon="mdi:delete" className="h-4 w-4" />
            </Button>
          </div>

          {/* Status badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {link.allowComments && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon icon="mdi:comment" className="h-3 w-3" />
                Comments enabled
              </span>
            )}
            {isExpired ? (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <Icon icon="mdi:clock-alert" className="h-3 w-3" />
                Expired
              </span>
            ) : link.expiresAt ? (
              <span className="flex items-center gap-1">
                <Icon icon="mdi:clock-outline" className="h-3 w-3" />
                Expires {format(new Date(link.expiresAt), "MMM d, yyyy")}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Icon icon="mdi:eye" className="h-3 w-3" />
              {link.viewCount} views
            </span>
          </div>
        </div>

       
      </div>
    </div>
  );
}

// ============================================================================
// Create Share Link Form
// ============================================================================

function CreateShareLinkForm({
  type,
  resourceId,
  entryId,
  onSuccess,
  onCancel,
}: {
  type: "document" | "image";
  resourceId: string;
  entryId: string;
  onSuccess: (link: ShareLink) => void;
  onCancel: () => void;
}) {
  const [allowComments, setAllowComments] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>("0");

  const createAction =
    type === "document"
      ? createDocumentShareLinkAction.bind(null, resourceId)
      : createImageShareLinkAction.bind(null, resourceId, entryId);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { error?: string },
      formData: FormData
    ) => {
      const result = await createAction(prevState, formData);
      if (result.success && result.shareLink) {
        onSuccess({
          id: result.shareLink.id,
          token: result.shareLink.token,
          url: result.shareLink.url,
          isEnabled: true,
          allowComments,
          expiresAt:
            expiresInDays !== "0"
              ? new Date(
                  Date.now() +
                    Number.parseInt(expiresInDays, 10) * 24 * 60 * 60 * 1000
                )
              : null,
          viewCount: 0,
          createdAt: new Date(),
        });
        toast.success("Share link created");
      }
      return result;
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-medium">Create New Link</h4>

      {/* Allow Comments Toggle */}
      {type === "document" && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowComments">Allow Comments</Label>
            <p className="text-xs text-muted-foreground">
              Let viewers leave comments and condolences
            </p>
          </div>
          <Switch
            id="allowComments"
            name="allowComments"
            checked={allowComments}
            onCheckedChange={setAllowComments}
          />
          <input
            type="hidden"
            name="allowComments"
            value={allowComments.toString()}
          />
        </div>
      )}

      {/* Expiration */}
      <div className="space-y-2">
        <Label htmlFor="expiresInDays">Link Expiration</Label>
        <Select value={expiresInDays} onValueChange={setExpiresInDays}>
          <SelectTrigger>
            <SelectValue placeholder="Select expiration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Never expires</SelectItem>
            <SelectItem value="1">1 day</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="expiresInDays" value={expiresInDays} />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Icon icon="mdi:link-plus" className="mr-2 h-4 w-4" />
              Create Link
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
