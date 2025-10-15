"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import type { AnchorData } from "@/lib/annotations";

interface QuotedCommentFormProps {
  documentId: string;
  quote?: AnchorData | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  action: (formData: FormData) => Promise<any>;
  placeholder?: string;
}

function SubmitButton({ hasQuote, disabled }: { hasQuote: boolean; disabled: boolean }) {
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
          <Icon icon={hasQuote ? "mdi:format-quote-close" : "mdi:send"} className="w-4 h-4 mr-2" />
          {hasQuote ? "Add Reply" : "Add Comment"}
        </>
      )}
    </Button>
  );
}

export const QuotedCommentForm = ({
  documentId,
  quote,
  onCancel,
  onSuccess,
  action,
  placeholder = "Share your thoughts or feedback...",
}: QuotedCommentFormProps) => {
  const [content, setContent] = useState("");
  const [includeQuote, setIncludeQuote] = useState(!!quote);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    // If quote is included, prepend it to the content as a blockquote
    let finalContent = content;
    if (includeQuote && quote) {
      const quotedText = quote.text
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');
      finalContent = `${quotedText}\n\n${content}`;
    }
    
    // Replace content in FormData
    formData.set("content", finalContent);
    
    // Still save anchor data for reference (optional - can be used later)
    if (includeQuote && quote) {
      formData.append("anchorStart", quote.start.toString());
      formData.append("anchorEnd", quote.end.toString());
      formData.append("anchorText", quote.text);
      formData.append("anchorPrefix", quote.prefix);
      formData.append("anchorSuffix", quote.suffix);
    }
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setContent("");
      setIncludeQuote(false);
      onSuccess?.();
    }
  };

  const handleRemoveQuote = () => {
    setIncludeQuote(false);
  };

  const truncateQuote = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      {quote && includeQuote && (
        <div className="relative p-4 pl-6 rounded-md bg-muted/50 border-l-4 border-primary">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveQuote}
            className="absolute top-2 right-2 h-7 px-2"
            title="Remove quote"
          >
            <Icon icon="mdi:close" className="w-4 h-4" />
          </Button>
          
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:format-quote-close" className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Replying to:
              </span>
            </div>
            <blockquote className="text-sm text-muted-foreground italic border-l-0 pl-0">
              {truncateQuote(quote.text)}
            </blockquote>
          </div>
        </div>
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
          placeholder={quote && includeQuote ? "Your reply..." : placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={5000}
          required
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{content.length}/5000 characters</span>
          
          {quote && !includeQuote && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIncludeQuote(true)}
              className="h-7 text-xs"
            >
              <Icon icon="mdi:format-quote-close" className="w-3 h-3 mr-1" />
              Re-add quote
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
          hasQuote={includeQuote && !!quote}
          disabled={!content.trim() || content.length > 5000}
        />
      </div>
    </form>
  );
};
