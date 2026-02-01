"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createSurveyAction } from "@/actions/pre-need-survey";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateSurveyDialogProps {
  entryId: string;
  entryName: string;
}

export function CreateSurveyDialog({
  entryId,
  entryName,
}: CreateSurveyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientRelationship, setClientRelationship] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("entryId", entryId);
    if (clientName) formData.append("clientName", clientName.trim());
    if (clientEmail) formData.append("clientEmail", clientEmail.trim());
    if (clientRelationship) formData.append("clientRelationship", clientRelationship.trim());
    if (hasPassword && password) formData.append("password", password);

    startTransition(async () => {
      const result = await createSurveyAction({}, formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.surveyId) {
        toast.success("Survey created!");
        setOpen(false);
        resetForm();

        // Copy share link
        if (result.shareUrl) {
          await navigator.clipboard.writeText(result.shareUrl);
          toast.success("Share link copied to clipboard");
        }

        // Navigate to the survey detail page
        router.push(`/dashboard/surveys/${result.surveyId}`);
      }
    });
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientRelationship("");
    setHasPassword(false);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="mdi:clipboard-text-plus" className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Pre-Need Survey</DialogTitle>
            <DialogDescription>
              Create a survey for <strong>{entryName}</strong> to collect
              important legacy planning information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                <span className="text-muted-foreground">Survey for: </span>
                <strong>{entryName}</strong>
              </p>
            </div>

            <AnimatedInput
              label="Client Name (optional)"
              name="clientName"
              controlled={true}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Person filling out the survey"
            />

            <AnimatedInput
              label="Client Email (optional)"
              name="clientEmail"
              type="email"
              controlled={true}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="For notifications"
            />

            <AnimatedInput
              label="Relationship (optional)"
              name="clientRelationship"
              controlled={true}
              value={clientRelationship}
              onChange={(e) => setClientRelationship(e.target.value)}
              placeholder="e.g., Spouse, Child, Self"
            />

            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPassword"
                  checked={hasPassword}
                  onCheckedChange={(checked) =>
                    setHasPassword(checked as boolean)
                  }
                />
                <Label htmlFor="hasPassword" className="text-sm">
                  Protect with password
                </Label>
              </div>

              {hasPassword && (
                <AnimatedInput
                  label="Password"
                  name="password"
                  type="password"
                  controlled={true}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password for the share link"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create & Copy Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
