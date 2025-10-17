"use client";

import { SearchResultCard } from "./search-result-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import type { UnifiedSearchResult } from "@/lib/api/saved-content";

interface SearchResultsProps {
  results: UnifiedSearchResult[];
  entryId: string;
  loading?: boolean;
  onQuoteSaved?: () => void;
}

export function SearchResults({
  results,
  entryId,
  loading,
  onQuoteSaved,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Try adjusting your search terms or filters. Make sure to select a faith tradition when
          searching for scripture.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            entryId={entryId}
            onSaved={onQuoteSaved}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-6 border rounded-lg">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
