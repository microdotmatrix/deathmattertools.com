import { getSavedQuotesByEntryId } from "@/lib/db/queries/quotes";
import { SavedQuoteCard } from "./saved-quote-card";
import { AddQuoteButton } from "./add-quote-button";
import { BookmarkPlus } from "lucide-react";

interface SavedQuotesListProps {
  entryId: string;
}

export async function SavedQuotesList({ entryId }: SavedQuotesListProps) {
  const quotes = await getSavedQuotesByEntryId(entryId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Saved Quotes & Scripture</h3>
          <p className="text-sm text-muted-foreground">
            {quotes.length === 0
              ? "No quotes saved yet"
              : `${quotes.length} ${quotes.length === 1 ? "quote" : "quotes"} saved`}
          </p>
        </div>
        <AddQuoteButton entryId={entryId} />
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <BookmarkPlus className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="font-semibold mb-2">No quotes saved yet</h4>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Search for meaningful quotes and scripture to add to this memorial entry.
          </p>
          <AddQuoteButton entryId={entryId} />
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <SavedQuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
