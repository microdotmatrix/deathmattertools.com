"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import type { SearchParams } from "@/lib/api/saved-content";

interface QuotesSearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function QuotesSearchForm({ onSearch, loading }: QuotesSearchFormProps) {
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    onSearch({
      query: query.trim(),
      type: "quote",
      author: author.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quote-keyword">Keyword</Label>
        <Input
          id="quote-keyword"
          placeholder="Search for quotes by keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-author">Author (optional)</Label>
        <Input
          id="quote-author"
          placeholder="Filter by author name..."
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading || !query.trim()} className="w-full">
        <Search className="mr-2 h-4 w-4" />
        {loading ? "Searching..." : "Search Quotes"}
      </Button>
    </form>
  );
}
