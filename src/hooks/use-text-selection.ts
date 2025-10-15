"use client";

import { useEffect, useState, RefObject } from "react";

export interface TextSelectionResult {
  selection: Selection | null;
  range: Range | null;
  text: string;
  isCollapsed: boolean;
}

/**
 * Hook to track text selection within a specific container element
 * @param containerRef - Reference to the container element to track selections in
 * @param enabled - Whether selection tracking is enabled (default: true)
 */
export function useTextSelection(
  containerRef: RefObject<HTMLElement>,
  enabled = true
): TextSelectionResult {
  const [selectionData, setSelectionData] = useState<TextSelectionResult>({
    selection: null,
    range: null,
    text: "",
    isCollapsed: true,
  });

  useEffect(() => {
    if (!enabled) {
      setSelectionData({
        selection: null,
        range: null,
        text: "",
        isCollapsed: true,
      });
      return;
    }

    function handleSelectionChange() {
      const selection = window.getSelection();
      const container = containerRef.current;

      if (!selection || selection.rangeCount === 0 || !container) {
        setSelectionData({
          selection: null,
          range: null,
          text: "",
          isCollapsed: true,
        });
        return;
      }

      const range = selection.getRangeAt(0);
      
      // Check if selection is within our container
      const isWithinContainer = container.contains(range.commonAncestorContainer);
      
      if (!isWithinContainer) {
        setSelectionData({
          selection: null,
          range: null,
          text: "",
          isCollapsed: true,
        });
        return;
      }

      // Get selected text
      const text = range.toString().trim();
      
      // Ignore if collapsed (just a cursor) or empty
      if (selection.isCollapsed || !text) {
        setSelectionData({
          selection,
          range: null,
          text: "",
          isCollapsed: true,
        });
        return;
      }

      setSelectionData({
        selection,
        range,
        text,
        isCollapsed: false,
      });
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [containerRef, enabled]);

  return selectionData;
}
