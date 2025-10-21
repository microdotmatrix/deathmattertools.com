"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DirectionAwareTabs } from "@/components/elements/animated-tabs";
import { QuotesSearchForm } from "./quotes-search-form";
import { ScriptureSearchForm } from "./scripture-search-form";
import { SearchResults } from "./search-results";
import { searchContent, type SearchParams, type UnifiedSearchResult } from "@/lib/api/saved-content";
import { toast } from "sonner";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  defaultType?: "quote" | "scripture";
}

export function SearchDialog({
  open,
  onOpenChange,
  entryId,
  defaultType = "quote",
}: SearchDialogProps) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (params: SearchParams) => {
    setHasSearched(true);
    
    startTransition(async () => {
      try {
        const searchResults = await searchContent(params);
        setResults(searchResults);
        
        if (searchResults.length === 0) {
          toast.info("No results found for your search");
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Search failed. Please try again.");
        setResults([]);
      }
    });
  };

  const handleQuoteSaved = () => {
    // Optionally refetch or update UI
    // Could also close dialog after save
  };

  const handleTabChange = () => {
    // Reset search state when switching tabs
    setResults([]);
    setHasSearched(false);
  };

  const tabs = [
    {
      id: 0,
      label: "Quotes",
      content: (
        <div className="space-y-6 pt-4">
          <QuotesSearchForm onSearch={handleSearch} loading={isPending} />
          
          {hasSearched && (
            <div className="overflow-hidden">
              <SearchResults
                results={results}
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
      content: (
        <div className="space-y-6 pt-4">
          <ScriptureSearchForm onSearch={handleSearch} loading={isPending} />
          
          {hasSearched && (
            <div className="overflow-hidden">
              <SearchResults
                results={results}
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
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DirectionAwareTabs tabs={tabs} className="mb-4" onChange={handleTabChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
