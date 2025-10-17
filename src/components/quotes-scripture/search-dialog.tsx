"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchForm } from "./search-form";
import { SearchResults } from "./search-results";
import { searchContent, type SearchParams, type UnifiedSearchResult } from "@/lib/api/saved-content";
import { toast } from "sonner";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  defaultType?: "quote" | "scripture" | "all";
}

export function SearchDialog({
  open,
  onOpenChange,
  entryId,
  defaultType = "all",
}: SearchDialogProps) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setHasSearched(true);
    
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
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSaved = () => {
    // Optionally refetch or update UI
    // Could also close dialog after save
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Quotes & Scripture</DialogTitle>
          <DialogDescription>
            Search for meaningful quotes and scripture to add to this memorial entry.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <SearchForm
            onSearch={handleSearch}
            defaultType={defaultType}
            loading={loading}
          />
          
          {hasSearched && (
            <div className="flex-1 overflow-hidden">
              <SearchResults
                results={results}
                entryId={entryId}
                loading={loading}
                onQuoteSaved={handleQuoteSaved}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
