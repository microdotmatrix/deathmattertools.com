import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  type DocumentStatus,
  getStatusConfig,
  isDocumentStatus,
  DEFAULT_DOCUMENT_STATUS,
} from "@/lib/document-status";

interface StatusBadgeProps {
  status: DocumentStatus;
  showIcon?: boolean;
  className?: string;
}

/**
 * StatusBadge - Reusable badge component for displaying document status
 *
 * Displays a color-coded badge with optional icon based on document status.
 * Uses centralized configuration from document-status module.
 *
 * @example
 * <StatusBadge status="draft" />
 * <StatusBadge status="published" showIcon={false} />
 */
export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  // Validate status and fallback to default if invalid
  const validStatus = isDocumentStatus(status) ? status : DEFAULT_DOCUMENT_STATUS;

  // Log warning in development if status was invalid
  if (!isDocumentStatus(status) && process.env.NODE_ENV === "development") {
    console.warn(
      `Invalid document status "${status}", falling back to "${DEFAULT_DOCUMENT_STATUS}"`
    );
  }

  const config = getStatusConfig(validStatus);

  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-1", config.className, className)}
      title={config.description}
    >
      {showIcon && <Icon icon={config.icon} className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
}
