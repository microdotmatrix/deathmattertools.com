"use client";

import { useMemo } from "react";
import { AnnotationIndicator } from "./annotation-indicator";
import { insertIndicators } from "@/lib/annotations/calculate-positions";
import type { AnnotationIndicator as IndicatorData } from "@/lib/annotations/calculate-positions";

interface AnnotatableTextProps {
  content: string;
  indicators: IndicatorData[];
  onIndicatorClick: (commentIds: string[]) => void;
  className?: string;
}

export const AnnotatableText = ({
  content,
  indicators,
  onIndicatorClick,
  className,
}: AnnotatableTextProps) => {
  const segments = useMemo(() => {
    return insertIndicators(content, indicators);
  }, [content, indicators]);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <span key={`text-${index}`}>
              {segment.content}
            </span>
          );
        } else if (segment.indicator) {
          return (
            <AnnotationIndicator
              key={`indicator-${index}`}
              commentIds={segment.indicator.commentIds}
              userColors={segment.indicator.userColors}
              statuses={segment.indicator.statuses}
              onClick={() => onIndicatorClick(segment.indicator!.commentIds)}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
