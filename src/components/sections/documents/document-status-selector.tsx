"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { updateDocumentStatusAction } from "@/lib/db/mutations/document-status";
import { type DocumentStatus, getStatusOptions } from "@/lib/document-status";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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

  // Read-only badge display for users without edit permission
  if (!canEdit) {
    return <StatusBadge status={optimisticStatus} className={className} />;
  }

  // Editable select for owners and org admins
  return (
    <Select
      value={optimisticStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger
        size="sm"
        className={cn("w-fit border-none", isPending && "opacity-50", className)}
      >
        <SelectValue>
          <StatusBadge status={optimisticStatus} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <StatusBadge status={option.value} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
