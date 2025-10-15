"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface SelectionToolbarProps {
  range: Range | null;
  onCreateComment: () => void;
  enabled?: boolean;
}

interface Position {
  top: number;
  left: number;
}

export const SelectionToolbar = ({
  range,
  onCreateComment,
  enabled = true,
}: SelectionToolbarProps) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!range || !enabled) {
      setPosition(null);
      return;
    }

    // Calculate position above the selection
    const rect = range.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    setPosition({
      top: rect.top + scrollY - 60, // 60px above selection
      left: rect.left + scrollX + rect.width / 2, // Center horizontally
    });
  }, [range, enabled]);

  // Don't render until mounted (avoid SSR issues)
  if (!mounted || !position || !range) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed z-50 flex items-center gap-2",
        "bg-popover border border-border rounded-lg shadow-lg",
        "px-3 py-2",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCreateComment();
        }}
        className="flex items-center gap-2 h-8"
      >
        <Icon icon="mdi:comment-plus" className="w-4 h-4" />
        <span className="text-sm">Add Comment</span>
      </Button>
      
      <span className="text-xs text-muted-foreground">
        {range.toString().length} chars selected
      </span>
    </div>,
    document.body
  );
};
