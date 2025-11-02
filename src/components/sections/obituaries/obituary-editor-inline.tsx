"use client";

import { updateObituaryContent } from "@/actions/obituaries";
import { Response } from "@/components/ai/response";
import { SelectionToolbar } from "@/components/annotations";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTextSelection } from "@/hooks/use-text-selection";
import { extractAnchorData, type AnchorData } from "@/lib/annotations";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown-converter";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import "./tiptap-editor.css";

interface ObituaryEditorInlineProps {
  documentId: string;
  entryId: string;
  initialContent: string;
  canEdit: boolean;
  canComment?: boolean;
  onCreateQuotedComment?: (anchor: AnchorData) => void;
}

export const ObituaryEditorInline = ({
  documentId,
  entryId,
  initialContent,
  canEdit,
  canComment = false,
  onCreateQuotedComment,
}: ObituaryEditorInlineProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Text selection for comments - only enabled in view mode
  const { range, text } = useTextSelection(
    contentRef as unknown as React.RefObject<HTMLElement>,
    canComment && !isEditing // Disable selection when editing
  );

  // Initialize TipTap editor
  // Convert Markdown to HTML for TipTap on initialization
  const editor = useEditor({
    extensions: [StarterKit],
    content: markdownToHtml(initialContent),
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Store as HTML internally while editing
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
      // Restore original markdown content by converting to HTML
      editor.commands.setContent(markdownToHtml(initialContent));
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
      const htmlContent = editor.getHTML();
      
      // Convert HTML back to Markdown for database storage
      const markdownContent = htmlToMarkdown(htmlContent);

      // Validate content before saving
      if (!markdownContent || markdownContent.trim().length === 0) {
        toast.error("Content cannot be empty");
        setIsSaving(false);
        return;
      }

      // Call server action with markdown content
      const result = await updateObituaryContent({
        documentId,
        entryId,
        content: markdownContent,
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
      setContent(markdownContent); // Store as markdown for view mode
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

  // Handle creating quoted comment from text selection
  const handleCreateComment = () => {
    if (range && contentRef.current && onCreateQuotedComment) {
      const anchor = extractAnchorData(range, contentRef.current);
      onCreateQuotedComment(anchor);
      
      // Clear selection after extracting
      window.getSelection()?.removeAllRanges();
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
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Content Display - Render Markdown with Response component */}
          <div 
            ref={contentRef}
            className="prose dark:prose-invert prose-md lg:prose-lg max-w-4xl"
          >
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
          
          {/* Selection toolbar for comments (only in view mode) */}
          {canComment && (
            <SelectionToolbar
              range={range}
              onCreateComment={handleCreateComment}
              enabled={!!text}
            />
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 p-2.5 border border-border rounded-lg bg-muted/30 shadow-sm">
            {/* Text Formatting */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Bold (Ctrl+B)"
              >
                <Icon icon="mdi:format-bold" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Italic (Ctrl+I)"
              >
                <Icon icon="mdi:format-italic" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Strikethrough"
              >
                <Icon icon="mdi:format-strikethrough" className="size-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Headings */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive("heading", { level: 1 }) ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Heading 1"
              >
                <span className="text-xs font-semibold">H1</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive("heading", { level: 2 }) ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Heading 2"
              >
                <span className="text-xs font-semibold">H2</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive("heading", { level: 3 }) ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Heading 3"
              >
                <span className="text-xs font-semibold">H3</span>
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Bullet List"
              >
                <Icon icon="mdi:format-list-bulleted" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Numbered List"
              >
                <Icon icon="mdi:format-list-numbered" className="size-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Other Formatting */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                title="Blockquote"
              >
                <Icon icon="mdi:format-quote-close" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="hover:bg-accent/50"
                title="Horizontal Rule"
              >
                <Icon icon="mdi:minus" className="size-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="hover:bg-accent/50 disabled:opacity-40"
                title="Undo (Ctrl+Z)"
              >
                <Icon icon="mdi:undo" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="hover:bg-accent/50 disabled:opacity-40"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Icon icon="mdi:redo" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="border border-border rounded-lg p-6 bg-background min-h-[400px] shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
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
          <div className="flex items-start gap-3 p-3.5 text-sm text-muted-foreground bg-muted/40 border border-border rounded-lg shadow-sm">
            <Icon icon="mdi:information-outline" className="size-5 mt-0.5 shrink-0 text-primary" />
            <p className="leading-relaxed">
              While editing, text selection for comments and the AI assistant are temporarily
              disabled. Save your changes to re-enable these features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
