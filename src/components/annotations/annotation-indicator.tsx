"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import type { AnchorStatus } from "@/lib/db/schema";
import { getPrimaryStatus } from "@/lib/annotations/calculate-positions";

interface AnnotationIndicatorProps {
  commentIds: string[];
  userColors: string[];
  statuses: AnchorStatus[];
  onClick: () => void;
  className?: string;
}

export const AnnotationIndicator = ({
  commentIds,
  userColors,
  statuses,
  onClick,
  className,
}: AnnotationIndicatorProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const count = commentIds.length;
  const primaryColor = userColors[0] || "#3B82F6";
  const primaryStatus = getPrimaryStatus(statuses);
  
  // Status icons
  const statusIcon = {
    approved: "mdi:check-circle",
    denied: "mdi:close-circle",
    pending: null,
  }[primaryStatus];
  
  const statusColor = {
    approved: "#10B981", // green
    denied: "#EF4444",   // red
    pending: null,
  }[primaryStatus];

  return (
    <span
      className={cn(
        "annotation-indicator inline-flex items-center justify-center relative",
        "cursor-pointer transition-all duration-200",
        "rounded-full",
        isHovered ? "w-3 h-3" : "w-2 h-2",
        className
      )}
      style={{
        backgroundColor: primaryColor,
        opacity: 0.8,
        marginLeft: "2px",
        marginRight: "2px",
        verticalAlign: "middle",
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${count} comment${count > 1 ? "s" : ""} here`}
    >
      {/* Count badge for multiple comments */}
      {count > 1 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center"
          style={{
            backgroundColor: "#fff",
            color: primaryColor,
            borderRadius: "50%",
            width: "12px",
            height: "12px",
            fontSize: "8px",
            fontWeight: "bold",
            border: `1px solid ${primaryColor}`,
          }}
        >
          {count}
        </span>
      )}
      
      {/* Status icon badge */}
      {statusIcon && (
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center"
          style={{
            backgroundColor: "#fff",
            borderRadius: "50%",
            width: "10px",
            height: "10px",
          }}
        >
          <Icon
            icon={statusIcon}
            style={{
              color: statusColor || undefined,
              fontSize: "8px",
            }}
          />
        </span>
      )}
      
      {/* Hover tooltip */}
      {isHovered && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs whitespace-nowrap"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#fff",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {count} comment{count > 1 ? "s" : ""}
          {primaryStatus !== "pending" && ` • ${primaryStatus}`}
        </span>
      )}
    </span>
  );
};
