"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { updateEntryAction } from "@/lib/db/mutations/entries";
import { ActionState } from "@/lib/utils";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

export const EntryForm = ({ 
  entry,
  isOrgOwner = false 
}: { 
  entry: any;
  isOrgOwner?: boolean;
}) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateEntryAction,
    {
      error: "",
    }
  );

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    entry.dateOfBirth ? new Date(entry.dateOfBirth) : undefined
  );

  const [dateOfDeath, setDateOfDeath] = useState<Date | undefined>(
    entry.dateOfDeath ? new Date(entry.dateOfDeath) : undefined
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Entry updated successfully");
    }
    if (state.error) {
      toast.error("Failed to update entry");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Admin editing indicator */}
      {isOrgOwner && (
        <Alert>
          <Icon icon="mdi:shield-account" className="h-4 w-4" />
          <AlertTitle>Editing as Organization Admin</AlertTitle>
          <AlertDescription>
            You are editing this entry with administrator permissions. 
            This entry was created by another team member.
          </AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="id" value={entry.id} />

      {/* Name */}
      <AnimatedInput
        label="Full Name"
        name="name"
        defaultValue={entry.name}
        placeholder="Enter full name"
        required
      />

      {/* Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <AnimatedInput
          label="Birth Location"
          name="birthLocation"
          defaultValue={entry.locationBorn || ""}
          placeholder="City, State/Country"
          required
        />
        <AnimatedInput
          label="Death Location"
          name="deathLocation"
          defaultValue={entry.locationDied || ""}
          placeholder="City, State/Country"
          required
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="space-y-0.5">
          <Label
            htmlFor="dateOfBirth"
            className="text-xs font-normal ml-1.25"
          >
            Birth Date
          </Label>
          <DatePicker
            label="Birth Date"
            date={dateOfBirth}
            setDate={setDateOfBirth}
            buttonClasses="h-10 w-full"
          />
          <input
            type="hidden"
            name="dateOfBirth"
            defaultValue={dateOfBirth?.toISOString() || ""}
          />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="dateOfDeath" className="text-xs font-normal ml-3">
            Death Date
          </Label>
          <DatePicker
            label="Death Date"
            date={dateOfDeath}
            setDate={setDateOfDeath}
            buttonClasses="h-10 w-full"
          />
          <input
            type="hidden"
            name="dateOfDeath"
            defaultValue={dateOfDeath?.toISOString() || ""}
          />
        </div>
      </div>

      {/* Cause of Death */}
      <AnimatedInput
        label="Cause of Death"
        name="causeOfDeath"
        defaultValue={entry.causeOfDeath}
        placeholder="Enter cause of death"
        required
      />
      
      {/* Hidden field to preserve image value */}
      <input type="hidden" name="image" value={entry.image} />

      {/* Submit Button - Full Width */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {pending ? (
            <Icon
              icon="mdi:loading"
              className="w-4 h-4 mr-2 animate-spin"
            />
          ) : (
            <Icon icon="mdi:content-save" className="w-4 h-4 mr-2" />
          )}
          {pending ? "Saving..." : "Save Changes"}
        </Button>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
};