"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getAnchorSummary } from "@/lib/annotations";
import type { AnchorData } from "@/lib/annotations";

interface AnchorPreviewProps {
  anchor: AnchorData;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const AnchorPreview = ({
  anchor,
  onRemove,
  showRemove = true,
}: AnchorPreviewProps) => {
  const summary = getAnchorSummary(anchor, 60);
  
  return (
    <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border border-border">
      <Icon icon="mdi:anchor" className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            Anchored to:
          </span>
          <Badge variant="outline" className="text-xs">
            {anchor.end - anchor.start} characters
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground italic break-words">
          &ldquo;{summary}&rdquo;
        </p>
        
        {anchor.prefix && (
          <div className="mt-2 text-xs text-muted-foreground/70">
            <span className="font-medium">Context:</span> ...{anchor.prefix}
            <span className="font-semibold text-foreground">[selection]</span>
            {anchor.suffix}...
          </div>
        )}
      </div>
      
      {showRemove && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 px-2 flex-shrink-0"
          title="Remove anchor (convert to regular comment)"
        >
          <Icon icon="mdi:close" className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
