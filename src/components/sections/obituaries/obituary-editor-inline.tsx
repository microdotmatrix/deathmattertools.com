"use client";

import { updateObituaryContent } from "@/actions/obituaries";
import { Response } from "@/components/ai/response";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import "./tiptap-editor.css";

interface ObituaryEditorInlineProps {
  documentId: string;
  entryId: string;
  initialContent: string;
  canEdit: boolean;
}

export const ObituaryEditorInline = ({
  documentId,
  entryId,
  initialContent,
  canEdit,
}: ObituaryEditorInlineProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Enter edit mode
  const handleEnterEditMode = () => {
    if (editor) {
      editor.setEditable(true);
      setIsEditing(true);
    }
  };

  // Exit edit mode without saving
  const handleCancel = () => {
    if (editor) {
      // Restore original content
      editor.commands.setContent(initialContent);
      editor.setEditable(false);
      setContent(initialContent);
      setIsEditing(false);
      setRetryCount(0);
    }
  };

  // Save changes with retry logic
  const handleSave = async (isRetry = false) => {
    if (!editor) return;

    setIsSaving(true);

    try {
      const updatedContent = editor.getHTML();

      // Validate content before saving
      if (!updatedContent || updatedContent.trim().length === 0) {
        toast.error("Content cannot be empty");
        setIsSaving(false);
        return;
      }

      // Call server action
      const result = await updateObituaryContent({
        documentId,
        entryId,
        content: updatedContent,
      });

      if (result.error) {
        // Handle specific errors
        if (result.error.includes("signed in")) {
          toast.error("Session expired. Please sign in again.");
          // Optionally redirect to sign-in
          return;
        }

        if (result.error.includes("owner")) {
          toast.error("You don't have permission to edit this obituary");
          setIsEditing(false);
          return;
        }

        // Generic error - offer retry
        if (retryCount < 2) {
          toast.error(result.error, {
            action: {
              label: "Retry",
              onClick: () => {
                setRetryCount((prev) => prev + 1);
                handleSave(true);
              },
            },
          });
        } else {
          toast.error(`${result.error} Please refresh the page and try again.`);
          setRetryCount(0);
        }
        return;
      }

      // Success!
      editor.setEditable(false);
      setIsEditing(false);
      setContent(updatedContent);
      setRetryCount(0);
      
      toast.success("Changes saved successfully");
      
      // Refresh to ensure we have latest data
      router.refresh();
    } catch (error) {
      console.error("Failed to save:", error);
      
      // Network or unexpected error - offer retry
      if (retryCount < 2) {
        toast.error("Failed to save changes", {
          action: {
            label: "Retry",
            onClick: () => {
              setRetryCount((prev) => prev + 1);
              handleSave(true);
            },
          },
        });
      } else {
        toast.error("Failed to save changes. Please check your connection and try again.");
        setRetryCount(0);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
      // Escape to cancel
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon icon="mdi:loading" className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      {/* View Mode */}
      {!isEditing && (
        <div className="space-y-4">
          {/* Content Display */}
          <div className="prose dark:prose-invert prose-md lg:prose-lg max-w-4xl">
            <Response>{content}</Response>
          </div>

          {/* Edit Button (Owner Only) */}
          {canEdit && (
            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnterEditMode}
              >
                <Icon icon="mdi:pencil" className="mr-2 size-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border border-border rounded-lg bg-muted/30">
            {/* Text Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-bold" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-italic" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-strikethrough" className="size-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Headings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
            >
              H3
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-list-bulleted" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-list-numbered" className="size-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Other Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive("blockquote") ? "bg-accent" : ""}
            >
              <Icon icon="mdi:format-quote-close" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Icon icon="mdi:minus" className="size-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              <Icon icon="mdi:undo" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
              <Icon icon="mdi:redo" className="size-4" />
            </Button>
          </div>

          {/* Editor Content */}
          <div className="border border-border rounded-lg p-6 bg-background min-h-[400px]">
            <EditorContent
              editor={editor}
              className="prose dark:prose-invert prose-md lg:prose-lg max-w-4xl focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                Cmd+S
              </kbd>{" "}
              to save •{" "}
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                Esc
              </kbd>{" "}
              to cancel
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Icon icon="mdi:loading" className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" className="mr-2 size-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-2 p-3 text-sm text-muted-foreground bg-muted/30 border border-border rounded-lg">
            <Icon icon="mdi:information-outline" className="size-5 mt-0.5 shrink-0" />
            <p>
              While editing, text selection for comments and the AI assistant are temporarily
              disabled. Save your changes to re-enable these features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
