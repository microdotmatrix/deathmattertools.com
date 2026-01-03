"use client";

import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDocumentStatusAction } from "@/lib/db/mutations/document-status";
import {
  type DocumentStatus,
  getStatusConfig,
  getStatusOptions,
} from "@/lib/document-status";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const STATUS_TEXT_COLORS: Record<DocumentStatus, string> = {
  draft: "text-slate-600 dark:text-slate-300",
  awaiting_review: "text-amber-600 dark:text-amber-400",
  needs_revisions: "text-orange-600 dark:text-orange-400",
  approved: "text-green-600 dark:text-green-400",
  published: "text-blue-600 dark:text-blue-400",
};

const STATUS_ICON_COLORS: Record<DocumentStatus, string> = {
  draft: "text-slate-500 dark:text-slate-400",
  awaiting_review: "text-amber-500 dark:text-amber-400",
  needs_revisions: "text-orange-500 dark:text-orange-400",
  approved: "text-green-500 dark:text-green-400",
  published: "text-blue-500 dark:text-blue-400",
};

const STATUS_BG_COLORS: Record<DocumentStatus, string> = {
  draft: "bg-slate-100/80 dark:bg-slate-800/50",
  awaiting_review: "bg-amber-50/80 dark:bg-amber-950/40",
  needs_revisions: "bg-orange-50/80 dark:bg-orange-950/40",
  approved: "bg-green-50/80 dark:bg-green-950/40",
  published: "bg-blue-50/80 dark:bg-blue-950/40",
};

interface DocumentStatusSelectorProps {
  documentId: string;
  currentStatus: DocumentStatus;
  canEdit: boolean;
  className?: string;
}

/**
 * DocumentStatusSelector - Interactive status selector for documents
 *
 * Displays current status and allows editing if user has permission.
 * Shows read-only badge if user cannot edit.
 *
 * @example
 * <DocumentStatusSelector
 *   documentId="doc-123"
 *   currentStatus="draft"
 *   canEdit={true}
 * />
 */
export function DocumentStatusSelector({
  documentId,
  currentStatus,
  canEdit,
  className,
}: DocumentStatusSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);
  const statusOptions = getStatusOptions();

  useEffect(() => {
    setOptimisticStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: DocumentStatus) => {
    if (newStatus === optimisticStatus) return;

    startTransition(async () => {
      const previousStatus = optimisticStatus;
      setOptimisticStatus(newStatus);

      const result = await updateDocumentStatusAction(documentId, newStatus);

      if ("error" in result) {
        setOptimisticStatus(previousStatus);
        toast.error(result.error);
      } else {
        toast.success("Status updated successfully");
        router.refresh();
      }
    });
  };

  const StatusDisplay = ({ status }: { status: DocumentStatus }) => {
    const statusConfig = getStatusConfig(status);
    return (
      <span className={cn("flex items-center gap-2", STATUS_TEXT_COLORS[status])}>
        <Icon
          icon={statusConfig.icon}
          className={cn("size-5", STATUS_ICON_COLORS[status])}
        />
        <span className="text-sm font-semibold tracking-wide">
          {statusConfig.label}
        </span>
      </span>
    );
  };

  // Read-only display for users without edit permission
  if (!canEdit) {
    return (
      <motion.div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3 py-1.5",
          STATUS_BG_COLORS[optimisticStatus],
          className
        )}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <StatusDisplay status={optimisticStatus} />
      </motion.div>
    );
  }

  // Editable select for owners and org admins
  return (
    <motion.div
      className={cn("relative inline-flex items-center", className)}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {optimisticStatus === "draft" && (
        <motion.span
          className="absolute -inset-1 rounded-xl bg-slate-400/15 dark:bg-slate-500/10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}
      <Select
        value={optimisticStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger
          size="sm"
          className={cn(
            "relative z-10 h-auto w-fit cursor-pointer gap-2 rounded-lg border-none px-3 py-1.5",
            STATUS_BG_COLORS[optimisticStatus],
            "hover:brightness-95 dark:hover:brightness-110",
            "transition-all duration-150",
            "focus:ring-2 focus:ring-offset-1",
            isPending && "opacity-50"
          )}
        >
          <SelectValue>
            <StatusDisplay status={optimisticStatus} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <StatusDisplay status={option.value} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
