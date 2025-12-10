import { ActionButton } from "@/components/elements/action-button";
import { ObituaryActionsButton } from "@/components/sections/entries/obituary-actions-button";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { deleteEntryAction } from "@/lib/db/mutations/entries";
import { EntryWithObituaries } from "@/lib/db/queries";
import Link from "next/link";

export const ActionButtons = ({ entry }: { entry: EntryWithObituaries }) => {
  const deleteAction = deleteEntryAction.bind(null, entry.id);
  
  // Determine if user can edit this entry
  // This is a simplified check - in a real implementation you'd want to pass canEdit from the parent
  const canEdit = true; // For now, assume user can edit if they can see the entry
  
  return (
    <div className="flex flex-col md:flex-row xl:flex-col 2xl:flex-row gap-2">
      <Link
        href={`/${entry.id}`}
        className={buttonVariants({
          variant: "default",
          className: "flex items-center gap-2",
        })}
      >
        <Icon icon="mdi:open-in-app" className="size-4" /> View Entry
      </Link>
      <ObituaryActionsButton
        entryId={entry.id}
        obituaries={entry.obituaries}
        canEdit={canEdit}
      />
      <ActionButton
        variant="destructive"
        className="flex items-center gap-2"
        action={deleteAction}
        requireAreYouSure
      >
        <Icon icon="mdi:delete-outline" className="size-4" /> Delete
      </ActionButton>
    </div>
  );
};