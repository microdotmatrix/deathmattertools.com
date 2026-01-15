"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { format } from "date-fns";
import { useState } from "react";
import { EntryForm } from "./entry-form";

interface Entry {
  id: string;
  name: string;
  locationBorn?: string | null;
  locationDied?: string | null;
  dateOfBirth?: string | Date | null;
  dateOfDeath?: string | Date | null;
  causeOfDeath?: string | null;
  image?: string | null;
}

interface EntryDisplayProps {
  entry: Entry;
  canEdit: boolean;
  isOrgOwner?: boolean;
}

export const EntryDisplay = ({
  entry,
  canEdit,
  isOrgOwner = false,
}: EntryDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "MMMM do, yyyy");
    } catch {
      return "—";
    }
  };

  if (isEditing && canEdit) {
    return (
        <EntryForm
          entry={entry}
          isOrgOwner={isOrgOwner}
          onCancel={() => setIsEditing(false)}
        />
    );
  }

  return (
    <div className="space-y-6 flex flex-col justify-between h-full">
      {/* Read-only display */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <span className="text-xs text-muted-foreground uppercase">Full Name</span>
          <h3 className="text-xl font-medium">{entry.name}</h3>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase">Birth Location</span>
            <p className="text-base">{entry.locationBorn || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase">Death Location</span>
            <p className="text-base">{entry.locationDied || "—"}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase">Birth Date</span>
            <p className="text-base">{formatDate(entry.dateOfBirth)}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase">Death Date</span>
            <p className="text-base">{formatDate(entry.dateOfDeath)}</p>
          </div>
        </div>

        {/* Cause of Death */}
        <div>
          <span className="text-xs text-muted-foreground uppercase">Cause of Death</span>
          <p className="text-base">{entry.causeOfDeath || "—"}</p>
        </div>
      </div>

      {/* Edit Button - only visible to those with edit permission */}
      {canEdit && (
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          <Icon icon="mdi:pencil" className="w-4 h-4 mr-2" />
          Edit Entry
        </Button>
      )}
    </div>
  );
};
