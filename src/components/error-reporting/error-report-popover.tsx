"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { ErrorReportForm } from "./error-report-form";

export const ErrorReportPopover = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Report an error"
        >
          <Icon icon="mdi:alert-circle-outline" className="size-5" />
          <span className="sr-only">Report an error</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={16}
        className="w-lg max-w-[90vw] p-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report an Error</h3>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() => setOpen(false)}
              >
                <Icon icon="mdi:close" className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Let us know what went wrong so we can fix it. Your feedback helps
              improve the platform for everyone.
            </p>
          </div>

          <ErrorReportForm onSuccess={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  );
};
