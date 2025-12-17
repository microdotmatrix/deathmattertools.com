"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon,
  count,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("border rounded-lg bg-card", className)}
    >
      <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
        <div className="flex items-center gap-3">
          {icon && (
            <Icon icon={icon} className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
          {count !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          )}
        </div>
        <Icon
          icon="mdi:chevron-down"
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-6 py-4 border-t">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
