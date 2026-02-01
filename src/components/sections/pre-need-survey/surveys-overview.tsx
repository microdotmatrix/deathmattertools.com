"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PreNeedSurvey } from "@/lib/db/schema";
import { SURVEY_STATUS_CONFIG } from "@/lib/survey-status/config";
import {
  lockSurveyAction,
  unlockSurveyAction,
  deleteSurveyAction,
} from "@/actions/pre-need-survey";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface SurveyWithEntry extends PreNeedSurvey {
  entryName: string;
}

interface SurveysOverviewProps {
  surveys: SurveyWithEntry[];
}

export function SurveysOverview({ surveys }: SurveysOverviewProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleLock = async (surveyId: string) => {
    startTransition(async () => {
      const result = await lockSurveyAction(surveyId, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey locked");
      }
    });
  };

  const handleUnlock = async (surveyId: string) => {
    startTransition(async () => {
      const result = await unlockSurveyAction(surveyId, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey unlocked");
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteSurveyAction(deleteId, {}, new FormData());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Survey deleted");
      }
      setDeleteId(null);
    });
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/survey/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon
          icon="mdi:clipboard-text-outline"
          className="mx-auto h-12 w-12 text-muted-foreground/50"
        />
        <h3 className="mt-4 text-lg font-semibold">No surveys yet</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Pre-need surveys are created from entry pages. Go to an entry and
          click "Create Survey" to get started.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard">
              <Icon icon="mdi:arrow-left" className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {surveys.map((survey) => {
        const config = SURVEY_STATUS_CONFIG[survey.status];

        return (
          <Card key={survey.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/${survey.entryId}`}
                      className="hover:underline"
                    >
                      {survey.entryName}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Created{" "}
                    {formatDistanceToNow(new Date(survey.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
                  <Icon icon={config.icon} className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {survey.isLocked && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:lock" className="h-3 w-3" />
                    Locked
                  </span>
                )}
                {survey.sharedAt && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:share" className="h-3 w-3" />
                    Shared{" "}
                    {formatDistanceToNow(new Date(survey.sharedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
                {survey.completedAt && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:check" className="h-3 w-3" />
                    Completed{" "}
                    {formatDistanceToNow(new Date(survey.completedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
                {survey.clientName && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:account" className="h-3 w-3" />
                    {survey.clientName}
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <div className="flex items-center gap-2 w-full">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/surveys/${survey.id}`}>
                    View Details
                  </Link>
                </Button>

                {survey.shareToken && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyShareLink(survey.shareToken!)}
                  >
                    <Icon icon="mdi:content-copy" className="mr-1 h-3 w-3" />
                    Copy Link
                  </Button>
                )}

                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Icon icon="mdi:dots-vertical" className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/${survey.entryId}`}>
                          <Icon icon="mdi:account" className="mr-2 h-4 w-4" />
                          View Entry
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {survey.isLocked ? (
                        <DropdownMenuItem
                          onClick={() => handleUnlock(survey.id)}
                          disabled={isPending}
                        >
                          <Icon icon="mdi:lock-open" className="mr-2 h-4 w-4" />
                          Unlock Survey
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleLock(survey.id)}
                          disabled={isPending}
                        >
                          <Icon icon="mdi:lock" className="mr-2 h-4 w-4" />
                          Lock Survey
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(survey.id)}
                        className="text-destructive"
                        disabled={isPending}
                      >
                        <Icon icon="mdi:delete" className="mr-2 h-4 w-4" />
                        Delete Survey
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the survey and all responses. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
