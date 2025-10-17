"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { SearchParams } from "@/lib/api/saved-content";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  defaultType?: "quote" | "scripture" | "all";
  loading?: boolean;
}

export function SearchForm({ onSearch, defaultType = "all", loading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"quote" | "scripture" | "all">(defaultType);
  const [faith, setFaith] = useState<"Christianity" | "Islam" | undefined>();
  const [author, setAuthor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    onSearch({
      query: query.trim(),
      type,
      faith: type === "scripture" ? faith : undefined,
      author: type === "quote" && author ? author : undefined,
    });
  };

  const showFaithSelector = type === "scripture" || type === "all";
  const showAuthorInput = type === "quote";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for quotes or scripture..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Select 
          value={type} 
          onValueChange={(v: "quote" | "scripture" | "all") => {
            setType(v);
            // Reset conditional fields when type changes
            if (v !== "scripture") setFaith(undefined);
            if (v !== "quote") setAuthor("");
          }}
          disabled={loading}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="quote">Quotes</SelectItem>
            <SelectItem value="scripture">Scripture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFaithSelector && (
        <Select 
          value={faith} 
          onValueChange={(v: "Christianity" | "Islam") => setFaith(v)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select faith tradition (required for scripture)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Christianity">Christianity (Bible)</SelectItem>
            <SelectItem value="Islam">Islam (Quran)</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showAuthorInput && (
        <Input
          placeholder="Filter by author (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          disabled={loading}
        />
      )}

      <Button type="submit" disabled={loading || !query.trim()} className="w-full sm:w-auto">
        <Search className="mr-2 h-4 w-4" />
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
