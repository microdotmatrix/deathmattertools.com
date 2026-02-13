"use client";

import {
  getHarvestPreviewAction,
  harvestSurveyToEntryAction,
} from "@/actions/survey-harvest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  groupByCategory,
  type HarvestFieldPreview,
  type SurveyFieldKey,
} from "@/lib/survey-to-entry-mapping";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

type SurveyHarvestDialogProps = {
  surveyId: string;
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SurveyHarvestDialog = ({
  surveyId,
  entryId,
  open,
  onOpenChange,
}: SurveyHarvestDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<HarvestFieldPreview[]>([]);
  const [selectedFields, setSelectedFields] = useState<Set<SurveyFieldKey>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load preview when dialog opens
  const loadPreview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getHarvestPreviewAction(surveyId);

    if (result.error) {
      setError(result.error);
      setPreview([]);
    } else if (result.preview) {
      setPreview(result.preview);
      // Select all non-conflicting fields by default
      const defaultSelected = result.preview
        .filter((p) => !p.hasConflict)
        .map((p) => p.surveyField);
      setSelectedFields(new Set(defaultSelected));
    }

    setIsLoading(false);
  }, [surveyId]);

  useEffect(() => {
    if (open) {
      loadPreview();
    } else {
      // Reset state when dialog closes
      setPreview([]);
      setSelectedFields(new Set());
      setError(null);
    }
  }, [open, loadPreview]);

  const toggleField = (field: SurveyFieldKey) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFields(new Set(preview.map((p) => p.surveyField)));
  };

  const selectNone = () => {
    setSelectedFields(new Set());
  };

  const handleHarvest = () => {
    if (selectedFields.size === 0) {
      toast.error("Please select at least one field to harvest");
      return;
    }

    startTransition(async () => {
      const result = await harvestSurveyToEntryAction(
        surveyId,
        Array.from(selectedFields),
      );

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(
          `Successfully updated ${result.fieldsUpdated} field${result.fieldsUpdated === 1 ? "" : "s"} in entry details`,
        );
        onOpenChange(false);
        router.refresh();
      }
    });
  };

  const groupedPreview = groupByCategory(preview);
  const conflictCount = preview.filter((p) => p.hasConflict).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="mdi:download" className="size-5" />
            Pull Survey Details to Entry
          </DialogTitle>
          <DialogDescription>
            Select which fields to copy from the survey response to the entry
            details. Fields with existing data will be overwritten.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              icon="mdi:loading"
              className="size-8 animate-spin text-muted-foreground"
            />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon
              icon="mdi:alert-circle-outline"
              className="size-12 text-destructive mb-3"
            />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : preview.length > 0 ? (
          <>
            {/* Selection controls */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {selectedFields.size} of {preview.length} fields selected
                </span>
                {conflictCount > 0 && (
                  <Badge variant="outline" className="text-amber-600">
                    {conflictCount} conflict{conflictCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectNone}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Fields list */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedPreview).map(([category, fields]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <HarvestFieldItem
                          key={field.surveyField}
                          field={field}
                          isSelected={selectedFields.has(field.surveyField)}
                          onToggle={() => toggleField(field.surveyField)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon
              icon="mdi:file-document-outline"
              className="size-12 text-muted-foreground mb-3"
            />
            <p className="text-sm text-muted-foreground">
              No harvestable fields found in the survey response.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleHarvest}
            disabled={isPending || isLoading || selectedFields.size === 0}
          >
            {isPending ? (
              <>
                <Icon icon="mdi:loading" className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Icon icon="mdi:check" className="mr-2 size-4" />
                Update Entry ({selectedFields.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type HarvestFieldItemProps = {
  field: HarvestFieldPreview;
  isSelected: boolean;
  onToggle: () => void;
};

const HarvestFieldItem = ({
  field,
  isSelected,
  onToggle,
}: HarvestFieldItemProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50",
        field.hasConflict && "border-amber-500/50",
      )}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={handleKeyDown}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={field.surveyField}
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Label
              htmlFor={field.surveyField}
              className="text-sm font-medium cursor-pointer"
            >
              {field.label}
            </Label>
            {field.hasConflict && (
              <Badge
                variant="outline"
                className="text-amber-600 text-[10px] py-0"
              >
                Will Overwrite
              </Badge>
            )}
          </div>

          {/* Survey value (new) */}
          <div className="text-sm text-foreground bg-muted/50 rounded px-2 py-1.5 mb-1">
            <span className="text-xs text-muted-foreground mr-1">New:</span>
            <span className="line-clamp-2">{field.surveyValue}</span>
          </div>

          {/* Existing value (if conflict) */}
          {field.hasConflict && field.existingValue && (
            <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded px-2 py-1.5">
              <span className="text-xs text-amber-600 mr-1">Current:</span>
              <span className="line-clamp-2">{field.existingValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
