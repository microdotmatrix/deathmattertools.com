"use client";

import {
  deleteObitSummaryAction,
  generateObitSummaryAction,
  saveObitSummaryAction,
} from "@/actions/obit-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { Document } from "@/lib/db/schema";
import { readStreamableValue } from "@ai-sdk/rsc";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface GenerateSummaryDialogProps {
  entryId: string;
  obituaries: Document[];
  currentSummary: string | null | undefined;
  onSummaryChange: (summary: string) => void;
  disabled?: boolean;
}

export function GenerateSummaryDialog({
  entryId,
  obituaries,
  currentSummary,
  onSummaryChange,
  disabled,
}: GenerateSummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedObituary, setSelectedObituary] = useState<Document | null>(
    null
  );
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasObituaries = obituaries.length > 0;
  const hasSavedSummary = !!currentSummary;

  const handleSelectObituary = (id: string) => {
    const obit = obituaries.find((o) => o.id === id);
    if (obit) {
      setSelectedObituary(obit);
      setGeneratedSummary("");
    }
  };

  const handleGenerate = async () => {
    if (!selectedObituary?.content) {
      toast.error("Please select an obituary first");
      return;
    }

    setIsGenerating(true);
    setGeneratedSummary("");

    try {
      const result = await generateObitSummaryAction(
        entryId,
        selectedObituary.content
      );

      if (result.error) {
        toast.error(result.error);
        setIsGenerating(false);
        return;
      }

      if (result.success && result.result) {
        try {
          for await (const text of readStreamableValue(result.result)) {
            setGeneratedSummary(text ?? "");
          }
          toast.success("Summary generated");
        } catch (streamError) {
          console.error("[handleGenerate stream error]", streamError);
          toast.error("Stream interrupted - please try again");
        }
      }
    } catch (error) {
      console.error("[handleGenerate]", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedSummary) {
      toast.error("No summary to save");
      return;
    }

    setIsSaving(true);

    startTransition(async () => {
      try {
        const result = await saveObitSummaryAction(entryId, generatedSummary);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Summary saved");
          onSummaryChange(generatedSummary);
          handleClose();
        }
      } catch (error) {
        console.error("[handleSave]", error);
        toast.error("Failed to save summary");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleDelete = async () => {
    setIsSaving(true);

    startTransition(async () => {
      try {
        const result = await deleteObitSummaryAction(entryId);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Summary deleted");
          onSummaryChange("");
          handleClose();
        }
      } catch (error) {
        console.error("[handleDelete]", error);
        toast.error("Failed to delete summary");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedObituary(null);
    setGeneratedSummary("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isGenerating && !isSaving) {
      if (newOpen) {
        setOpen(true);
      } else {
        handleClose();
      }
    }
  };

  const wordCount = generatedSummary.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isPending}
          className="shrink-0"
        >
          <Icon icon="mdi:sparkles" className="w-4 h-4 mr-2" />
          {hasSavedSummary ? "Edit Summary" : "Generate Summary"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="mdi:text-box-outline" className="h-5 w-5" />
            Generate Obituary Summary
          </DialogTitle>
          <DialogDescription>
            Create a ~100 word summary from one of your saved obituaries for use
            on memorial cards.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {!hasObituaries ? (
            <EmptyState entryId={entryId} onClose={handleClose} />
          ) : (
            <>
              <ObituarySelector
                obituaries={obituaries}
                selectedId={selectedObituary?.id ?? null}
                onSelect={handleSelectObituary}
                disabled={isGenerating || isSaving}
              />

              {!generatedSummary && (
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!selectedObituary || isGenerating || isSaving}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:sparkles" className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              )}

              {(generatedSummary || isGenerating) && (
                <SummaryPreview
                  summary={generatedSummary}
                  wordCount={wordCount}
                  isGenerating={isGenerating}
                  isSaving={isSaving}
                  hasSavedSummary={hasSavedSummary}
                  onRegenerate={handleGenerate}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onCancel={handleClose}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({
  entryId,
  onClose,
}: {
  entryId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon
        icon="mdi:file-document-outline"
        className="h-12 w-12 text-muted-foreground mb-4"
      />
      <h3 className="font-medium text-lg mb-2">No Obituaries Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Create an obituary first to generate a summary for your memorial card.
      </p>
      <Link
        href={`/${entryId}/obituaries/create`}
        onClick={onClose}
        className={buttonVariants({ variant: "default" })}
      >
        <Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
        Create Obituary
      </Link>
    </div>
  );
}

function ObituarySelector({
  obituaries,
  selectedId,
  onSelect,
  disabled,
}: {
  obituaries: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Obituary to Summarize</Label>

      <ScrollArea className="h-[200px] rounded-md border p-3">
        <RadioGroup
          value={selectedId ?? ""}
          onValueChange={onSelect}
          disabled={disabled}
          className="space-y-2"
        >
          {obituaries.map((obituary) => (
            <div
              key={obituary.id}
              className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem
                value={obituary.id}
                id={obituary.id}
                className="mt-1"
              />
              <Label
                htmlFor={obituary.id}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {obituary.title || "Untitled Obituary"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(obituary.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {obituary.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {obituary.content.slice(0, 150)}...
                  </p>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
}

function SummaryPreview({
  summary,
  wordCount,
  isGenerating,
  isSaving,
  hasSavedSummary,
  onRegenerate,
  onSave,
  onDelete,
  onCancel,
}: {
  summary: string;
  wordCount: number;
  isGenerating: boolean;
  isSaving: boolean;
  hasSavedSummary: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Generated Summary</Label>
          <span className="text-xs text-muted-foreground">
            {wordCount} words
          </span>
        </div>

        <Textarea
          value={summary}
          readOnly
          className="min-h-[150px] resize-none bg-muted/30"
          disabled={isGenerating}
          placeholder={isGenerating ? "Generating summary..." : ""}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isGenerating || isSaving}
        >
          Cancel
        </Button>

        {hasSavedSummary && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isGenerating || isSaving}
          >
            <Icon icon="mdi:delete" className="mr-2 h-4 w-4" />
            Delete Saved
          </Button>
        )}

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={isGenerating || isSaving}
        >
          {isGenerating ? (
            <>
              <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Icon icon="mdi:refresh" className="mr-2 h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={isGenerating || isSaving || !summary}
        >
          {isSaving ? (
            <>
              <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Icon icon="mdi:check" className="mr-2 h-4 w-4" />
              Save Summary
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
