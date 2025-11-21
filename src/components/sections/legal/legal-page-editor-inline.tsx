"use client";

import { updatePageContentAction } from "@/actions/page-content-actions";
import { MessageResponse as MarkdownRenderer } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown-converter";
import { useUser } from "@clerk/nextjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import "../obituaries/tiptap-editor.css";

interface LegalPageEditorInlineProps {
  slug: string;
  title: string;
  initialContent?: string;
}

export function LegalPageEditorInline({
  slug,
  title,
  initialContent = "",
}: LegalPageEditorInlineProps) {
  const { user } = useUser();
  const isSystemAdmin = user?.publicMetadata?.role === "system_admin";
  const [isEditing, setIsEditing] = useState(false);
  const [pageTitle, setPageTitle] = useState(title);
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Track mounted state for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: markdownToHtml(initialContent),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-md lg:prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Update editor content when initial content changes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(markdownToHtml(initialContent));
      setContent(initialContent);
    }
  }, [editor, initialContent]);

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
      editor.commands.setContent(markdownToHtml(initialContent));
      editor.setEditable(false);
      setContent(initialContent);
      setPageTitle(title);
      setIsEditing(false);
    }
  };

  // Save changes
  const handleSave = () => {
    if (!editor) return;

    const htmlContent = editor.getHTML();
    const markdownContent = htmlToMarkdown(htmlContent);

    startTransition(async () => {
      const result = await updatePageContentAction({
        slug,
        title: pageTitle,
        content: markdownContent,
      });

      if (result.success) {
        if (editor) {
          editor.setEditable(false);
        }
        setIsEditing(false);
        setContent(markdownContent);
        toast.success("Page updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to update page", {
          description: result.error || "Please try again",
        });
      }
    });
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
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
      {/* Floating Edit Button (Admin Only, View Mode) */}
      {isSystemAdmin && !isEditing && (
        <Button
          variant="default"
          size="icon"
          onClick={handleEnterEditMode}
          className="absolute -top-16 md:-top-18 -right-4 z-10 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
          title="Edit Page"
        >
          <Icon icon="mdi:pencil" className="size-4" />
        </Button>
      )}

      {/* View Mode */}
      {!isEditing && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Content Display */}
          <div className="prose dark:prose-invert prose-md lg:prose-lg max-w-none [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:list-outside [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:list-outside">
            {content ? (
              <MarkdownRenderer>{content}</MarkdownRenderer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No content available. Click Edit to add content.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Title Editor */}
          <div className="space-y-2 pb-4 border-b border-border">
            <Label htmlFor="page-title" className="text-sm font-medium">
              Page Title
            </Label>
            <Input
              id="page-title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Enter page title"
              disabled={isPending}
              className="text-lg font-semibold"
            />
          </div>

          {/* Editor Content */}
          <div className="border border-border rounded-lg p-6 bg-background min-h-[400px] shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
            <EditorContent
              editor={editor}
              className="tiptap-editor-content"
            />
          </div>
        </div>
      )}

      {/* Floating Toolbar (Edit Mode Only) - Rendered via Portal */}
      {isEditing && isMounted && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5">
              {/* Text Formatting */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run() || isPending}
                  className={editor.isActive("bold") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Bold (Ctrl+B)"
                >
                  <Icon icon="mdi:format-bold" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run() || isPending}
                  className={editor.isActive("italic") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Italic (Ctrl+I)"
                >
                  <Icon icon="mdi:format-italic" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run() || isPending}
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
                  disabled={isPending}
                  className={editor.isActive("heading", { level: 1 }) ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Heading 1"
                >
                  <span className="text-xs font-semibold">H1</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  disabled={isPending}
                  className={editor.isActive("heading", { level: 2 }) ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Heading 2"
                >
                  <span className="text-xs font-semibold">H2</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  disabled={isPending}
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
                  disabled={isPending}
                  className={editor.isActive("bulletList") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Bullet List"
                >
                  <Icon icon="mdi:format-list-bulleted" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  disabled={isPending}
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
                  disabled={isPending}
                  className={editor.isActive("blockquote") ? "bg-accent hover:bg-accent/80" : "hover:bg-accent/50"}
                  title="Blockquote"
                >
                  <Icon icon="mdi:format-quote-close" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  disabled={isPending}
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
                  disabled={!editor.can().chain().focus().undo().run() || isPending}
                  className="hover:bg-accent/50 disabled:opacity-40"
                  title="Undo (Ctrl+Z)"
                >
                  <Icon icon="mdi:undo" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run() || isPending}
                  className="hover:bg-accent/50 disabled:opacity-40"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Icon icon="mdi:redo" className="size-4" />
                </Button>
              </div>

              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground hidden sm:block">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Cmd+S
                  </kbd>{" "}
                  save •{" "}
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Esc
                  </kbd>{" "}
                  cancel
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
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
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
