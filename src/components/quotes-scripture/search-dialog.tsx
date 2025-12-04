"use client";

import { DirectionAwareTabs } from "@/components/elements/animated-tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchContent, type SearchParams, type UnifiedSearchResult } from "@/lib/api/saved-content";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { QuotesSearchForm } from "./quotes-search-form";
import { ScriptureSearchForm } from "./scripture-search-form";
import { SearchResults } from "./search-results";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  defaultType?: "quote" | "scripture";
}

type TabKey = "quote" | "scripture";

type TabState = Record<
  TabKey,
  {
    results: UnifiedSearchResult[];
    hasSearched: boolean;
  }
>;

export function SearchDialog({
  open,
  onOpenChange,
  entryId,
  defaultType = "quote",
}: SearchDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [tabState, setTabState] = useState<TabState>({
    quote: { results: [], hasSearched: false },
    scripture: { results: [], hasSearched: false },
  });

  const handleReset = () => {
    setTabState({
      quote: { results: [], hasSearched: false },
      scripture: { results: [], hasSearched: false },
    });
  };

  const handleSearchForTab =
    (tabKey: TabKey) =>
    (params: SearchParams) => {
      setTabState((prev) => ({
        ...prev,
        [tabKey]: { ...prev[tabKey], hasSearched: true },
      }));

      startTransition(async () => {
        try {
          const searchResults = await searchContent(params);
          setTabState((prev) => ({
            ...prev,
            [tabKey]: { hasSearched: true, results: searchResults },
          }));

          if (searchResults.length === 0) {
            toast.info("No results found for your search");
          }
        } catch (error) {
          console.error("Search failed:", error);
          toast.error("Search failed. Please try again.");
          setTabState((prev) => ({
            ...prev,
            [tabKey]: { hasSearched: true, results: [] },
          }));
        }
      });
    };

  const handleQuoteSaved = () => {
    // Optionally refetch or update UI
    // Could also close dialog after save
  };

  const tabs = [
    {
      id: 0,
      label: "Quotes",
      key: "quote" as const,
      content: (
        <div className="space-y-6 pt-4 pb-2">
          <QuotesSearchForm onSearch={handleSearchForTab("quote")} loading={isPending} />
          
          {tabState.quote.hasSearched && (
            <div className="overflow-hidden">
              <SearchResults
                results={tabState.quote.results}
                entryId={entryId}
                loading={isPending}
                onQuoteSaved={handleQuoteSaved}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 1,
      label: "Scripture",
      key: "scripture" as const,
      content: (
        <div className="space-y-6 pt-4 pb-2">
          <ScriptureSearchForm onSearch={handleSearchForTab("scripture")} loading={isPending} />
          
          {tabState.scripture.hasSearched && (
            <div className="overflow-hidden">
              <SearchResults
                results={tabState.scripture.results}
                entryId={entryId}
                loading={isPending}
                onQuoteSaved={handleQuoteSaved}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Quotes & Scripture</DialogTitle>
          <DialogDescription>
            Search for meaningful quotes and scripture to add to this memorial entry.
          </DialogDescription>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset results
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DirectionAwareTabs tabs={tabs} className="mb-4" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
