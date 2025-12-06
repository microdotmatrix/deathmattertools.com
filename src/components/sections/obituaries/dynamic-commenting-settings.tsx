import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamic import for OrganizationCommentingSettings
// Only loads when owner has an organization context
const OrganizationCommentingSettingsLazy = dynamic(
  () =>
    import("./commenting-settings").then(
      (mod) => mod.OrganizationCommentingSettings
    ),
  {
    loading: () => (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-60" />
      </div>
    ),
  }
);

interface DynamicCommentingSettingsProps {
  documentId: string;
  initialEnabled: boolean;
  canModify: boolean;
  disabledReason?: string | null;
  organizationMemberCount?: number;
  organizationInContext?: boolean;
}

export const DynamicCommentingSettings = (
  props: DynamicCommentingSettingsProps
) => {
  return <OrganizationCommentingSettingsLazy {...props} />;
};
