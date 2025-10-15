"use client";

import { useEffect, useState, useRef } from "react";
import { AnnotationIndicator } from "./annotation-indicator";
import { calculateIndicatorPositions as calculateYPositions } from "@/lib/annotations/position-calculator";
import type { AnnotationIndicator as IndicatorData } from "@/lib/annotations/calculate-positions";

interface IndicatorPosition {
  commentIds: string[];
  userColors: string[];
  statuses: ("pending" | "approved" | "denied")[];
  yPosition: number;
}

interface MarginIndicatorsProps {
  indicators: IndicatorData[];
  contentRef: React.RefObject<HTMLElement>;
  onIndicatorClick: (commentIds: string[]) => void;
}

export const MarginIndicators = ({
  indicators,
  contentRef,
  onIndicatorClick,
}: MarginIndicatorsProps) => {
  const [positions, setPositions] = useState<IndicatorPosition[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const calculatePositions = () => {
      if (!contentRef.current || indicators.length === 0) {
        setPositions([]);
        return;
      }

      // Convert indicator data to position format
      const anchorData = indicators.map((ind) => ({
        position: ind.position,
        commentIds: ind.commentIds,
        userColors: ind.userColors,
        statuses: ind.statuses,
      }));

      // Calculate Y positions
      const newPositions = calculateYPositions(contentRef.current, anchorData);
      setPositions(newPositions);
    };

    // Initial calculation after a short delay to ensure content is rendered
    const timeoutId = setTimeout(calculatePositions, 100);

    // Recalculate on window resize
    const handleResize = () => {
      // Debounce with requestAnimationFrame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(calculatePositions);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [indicators, contentRef]);

  if (positions.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 w-8 pointer-events-auto">
      {positions.map((pos, index) => (
        <div
          key={`indicator-${index}-${pos.commentIds.join("-")}`}
          className="absolute -translate-y-1/2"
          style={{ top: `${pos.yPosition}px` }}
        >
          <AnnotationIndicator
            commentIds={pos.commentIds}
            userColors={pos.userColors}
            statuses={pos.statuses}
            onClick={() => onIndicatorClick(pos.commentIds)}
          />
        </div>
      ))}
    </div>
  );
};
