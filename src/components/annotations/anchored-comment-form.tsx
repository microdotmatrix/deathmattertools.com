"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { AnchorPreview } from "./anchor-preview";
import type { AnchorData } from "@/lib/annotations";

interface AnchoredCommentFormProps {
  documentId: string;
  anchor?: AnchorData | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  action: (formData: FormData) => Promise<any>;
  placeholder?: string;
}

function SubmitButton({ hasAnchor, disabled }: { hasAnchor: boolean; disabled: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Icon icon={hasAnchor ? "mdi:anchor" : "mdi:send"} className="w-4 h-4 mr-2" />
          {hasAnchor ? "Add Anchored Comment" : "Add Comment"}
        </>
      )}
    </Button>
  );
}

export const AnchoredCommentForm = ({
  documentId,
  anchor,
  onCancel,
  onSuccess,
  action,
  placeholder = "Share your thoughts or feedback...",
}: AnchoredCommentFormProps) => {
  const [content, setContent] = useState("");
  const [includeAnchor, setIncludeAnchor] = useState(!!anchor);
  const [error, setError] = useState<string | null>(null);

  // Update includeAnchor when anchor prop changes
  useEffect(() => {
    setIncludeAnchor(!!anchor);
  }, [anchor]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    // Add anchor data if included
    if (includeAnchor && anchor) {
      formData.append("anchorStart", anchor.start.toString());
      formData.append("anchorEnd", anchor.end.toString());
      formData.append("anchorText", anchor.text);
      formData.append("anchorPrefix", anchor.prefix);
      formData.append("anchorSuffix", anchor.suffix);
    }
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setContent("");
      setIncludeAnchor(false);
      onSuccess?.();
    }
  };

  const handleRemoveAnchor = () => {
    setIncludeAnchor(false);
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      {anchor && includeAnchor && (
        <AnchorPreview
          anchor={anchor}
          onRemove={handleRemoveAnchor}
          showRemove={true}
        />
      )}
      
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Textarea
          name="content"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={5000}
          required
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{content.length}/5000 characters</span>
          
          {anchor && !includeAnchor && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIncludeAnchor(true)}
              className="h-7 text-xs"
            >
              <Icon icon="mdi:anchor" className="w-3 h-3 mr-1" />
              Re-attach anchor
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        
        <SubmitButton
          hasAnchor={includeAnchor && !!anchor}
          disabled={!content.trim() || content.length > 5000}
        />
      </div>
    </form>
  );
};
