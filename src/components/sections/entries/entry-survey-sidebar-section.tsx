"use client";

import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { SurveyStatus } from "@/lib/db/schema";
import { SURVEY_STATUS_CONFIG } from "@/lib/survey-status/config";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronDown, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateSurveyDialog } from "../pre-need-survey/create-survey-dialog";
import { SurveyHarvestDialog } from "./survey-harvest-dialog";

type SerializedSurvey = {
  id: string;
  entryId: string;
  userId: string;
  organizationId: string | null;
  title: string | null;
  status: SurveyStatus;
  completionPercentage: number;
  currentStep: number | null;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string | null;
  lockedAt: string | null;
  lastClientAccessAt: string | null;
};

type EntrySurveySidebarSectionProps = {
  entryId: string;
  entryName: string;
  surveys: SerializedSurvey[];
  canEdit: boolean;
};

export const EntrySurveySidebarSection = ({
  entryId,
  entryName,
  surveys,
  canEdit,
}: EntrySurveySidebarSectionProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showHarvestDialog, setShowHarvestDialog] = useState(false);

  // Get the most recent survey for this entry
  const survey = surveys[0] ?? null;
  const statusConfig = survey ? SURVEY_STATUS_CONFIG[survey.status] : null;

  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center gap-2">
              <Icon icon="mdi:clipboard-text-outline" className="size-4" />
              Pre-Need Survey
              <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              {survey ? (
                <SurveyStatus
                  survey={survey}
                  entryId={entryId}
                  canEdit={canEdit}
                  statusConfig={statusConfig!}
                  onSendSurvey={() => setShowCreateDialog(true)}
                  onHarvestSurvey={() => setShowHarvestDialog(true)}
                />
              ) : (
                <NoSurveyState
                  entryId={entryId}
                  canEdit={canEdit}
                  onSendSurvey={() => setShowCreateDialog(true)}
                />
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Create Survey Dialog */}
      {canEdit && (
        <CreateSurveyDialog
          entryId={entryId}
          entryName={entryName}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      )}

      {/* Harvest Survey Dialog */}
      {canEdit && survey && (
        <SurveyHarvestDialog
          surveyId={survey.id}
          entryId={entryId}
          open={showHarvestDialog}
          onOpenChange={setShowHarvestDialog}
        />
      )}
    </>
  );
};

type SurveyStatusProps = {
  survey: SerializedSurvey;
  entryId: string;
  canEdit: boolean;
  statusConfig: (typeof SURVEY_STATUS_CONFIG)[keyof typeof SURVEY_STATUS_CONFIG];
  onSendSurvey: () => void;
  onHarvestSurvey: () => void;
};

const SurveyStatus = ({
  survey,
  entryId,
  canEdit,
  statusConfig,
  onSendSurvey,
  onHarvestSurvey,
}: SurveyStatusProps) => {
  const isInProgress = ["draft", "shared"].includes(survey.status);
  const isSubmitted = survey.status === "submitted";
  const isUnderReview = survey.status === "under_review";
  const isApproved = survey.status === "approved";
  const isLocked = survey.status === "locked";

  return (
    <div className="space-y-3 px-2">
      {/* Status Badge */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
          statusConfig.className
        )}
      >
        <Icon icon={statusConfig.icon} className="size-4 shrink-0" />
        <span className="font-medium">{statusConfig.label}</span>
      </div>

      {/* Progress indicator for in-progress surveys */}
      {isInProgress && survey.completionPercentage > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{survey.completionPercentage}%</span>
          </div>
          <Progress value={survey.completionPercentage} className="h-1.5" />
        </div>
      )}

      {/* Last activity */}
      {survey.lastClientAccessAt && (
        <p className="text-xs text-muted-foreground">
          Last activity:{" "}
          {format(new Date(survey.lastClientAccessAt), "MMM d, yyyy")}
        </p>
      )}

      {/* Action buttons based on status */}
      <SidebarMenu>
        {/* Draft or Shared - Continue filling or view */}
        {isInProgress && canEdit && (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm">
                <Link href={`/${entryId}/survey`}>
                  <Icon icon="mdi:pencil" className="size-4" />
                  <span>
                    {survey.completionPercentage > 0
                      ? "Continue Survey"
                      : "Complete Survey"}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {survey.shareToken && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Link
                    href={`/survey/${survey.shareToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon icon="mdi:open-in-new" className="size-4" />
                    <span>View Share Link</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}

        {/* Submitted - Review button */}
        {isSubmitted && canEdit && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Link href={`/dashboard/surveys?surveyId=${survey.id}`}>
                <Icon icon="mdi:eye-check" className="size-4" />
                <span>Review Survey</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Under Review - Continue review */}
        {isUnderReview && canEdit && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Link href={`/dashboard/surveys?surveyId=${survey.id}`}>
                <Icon icon="mdi:clipboard-check" className="size-4" />
                <span>Continue Review</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Approved - View and Pull Details */}
        {isApproved && (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm">
                <Link href={`/dashboard/surveys?surveyId=${survey.id}`}>
                  <Icon icon="mdi:file-document-check" className="size-4" />
                  <span>View Survey</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {canEdit && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  className="text-primary hover:text-primary"
                  onClick={onHarvestSurvey}
                >
                  <Icon icon="mdi:download" className="size-4" />
                  <span>Pull Details to Entry</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}

        {/* Locked - View only */}
        {isLocked && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Link href={`/dashboard/surveys?surveyId=${survey.id}`}>
                <Icon icon="mdi:lock" className="size-4" />
                <span>View Locked Survey</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </div>
  );
};

type NoSurveyStateProps = {
  entryId: string;
  canEdit: boolean;
  onSendSurvey: () => void;
};

const NoSurveyState = ({
  entryId,
  canEdit,
  onSendSurvey,
}: NoSurveyStateProps) => {
  if (!canEdit) {
    return (
      <p className="px-2 text-xs text-muted-foreground">
        No pre-need survey has been created for this entry.
      </p>
    );
  }

  return (
    <div className="space-y-3 px-2">
      <p className="text-xs text-muted-foreground">
        Gather important information from family members or prepare details in
        advance.
      </p>
      <div className="flex flex-col gap-2">
        <Button asChild variant="default" size="sm" className="w-full">
          <Link href={`/${entryId}/survey`}>
            <Plus className="size-4 mr-2" />
            Complete Survey
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onSendSurvey}
        >
          <Send className="size-4 mr-2" />
          Send to Family
        </Button>
      </div>
    </div>
  );
};
