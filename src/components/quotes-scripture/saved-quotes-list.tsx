import { getSavedQuotesByEntryId } from "@/lib/db/queries/quotes";
import { AddQuoteButton } from "./add-quote-button";
import { SavedQuoteCard } from "./saved-quote-card";

interface SavedQuotesListProps {
  entryId: string;
}

export async function SavedQuotesList({ entryId }: SavedQuotesListProps) {
  const quotes = await getSavedQuotesByEntryId(entryId);

  return (
    <div className="space-y-3">
      {quotes.length > 0 ? (
        <>
          <div className="space-y-2">
            {quotes.map((quote) => (
              <SavedQuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} saved
            </p>
            <AddQuoteButton entryId={entryId} variant="outline" size="sm" />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            No quotes saved yet.
          </p>
          <AddQuoteButton entryId={entryId} variant="outline" size="sm" className="w-full" />
        </>
      )}
    </div>
  );
}
