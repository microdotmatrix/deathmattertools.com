"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import type { SearchParams } from "@/lib/api/saved-content";

interface ScriptureSearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function ScriptureSearchForm({ onSearch, loading }: ScriptureSearchFormProps) {
  const [query, setQuery] = useState("");
  const [faith, setFaith] = useState<"Christianity" | "Islam">("Christianity");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    onSearch({
      query: query.trim(),
      type: "scripture",
      faith,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scripture-keyword">Keyword</Label>
        <Input
          id="scripture-keyword"
          placeholder="Search scripture by keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scripture-faith">Faith Tradition</Label>
        <Select 
          value={faith} 
          onValueChange={(v: "Christianity" | "Islam") => setFaith(v)}
          disabled={loading}
        >
          <SelectTrigger id="scripture-faith">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Christianity">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Christianity (Bible)
              </div>
            </SelectItem>
            <SelectItem value="Islam">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Islam (Quran)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !query.trim()} className="w-full">
        <Search className="mr-2 h-4 w-4" />
        {loading ? "Searching..." : "Search Scripture"}
      </Button>
    </form>
  );
}
