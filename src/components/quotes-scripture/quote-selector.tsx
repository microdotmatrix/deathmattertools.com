"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Quote } from "lucide-react";
import type { SavedQuote } from "@/lib/db/schema";

interface QuoteSelectorProps {
  quotes: SavedQuote[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function QuoteSelector({ quotes, selectedIds, onSelectionChange }: QuoteSelectorProps) {
  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === quotes.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(quotes.map((q) => q.id));
    }
  };

  if (quotes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Include Saved Quotes</CardTitle>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selectedIds.length === quotes.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Selected quotes will be incorporated naturally into the generated obituary
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {quotes.map((quote) => {
          const icon = quote.type === "scripture" ? BookOpen : Quote;
          const Icon = icon;
          const isSelected = selectedIds.includes(quote.id);

          return (
            <label
              key={quote.id}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-muted/50 border-primary" : "hover:bg-muted/30"
              }`}
              htmlFor={`quote-${quote.id}`}
            >
              <Checkbox 
                id={`quote-${quote.id}`}
                checked={isSelected} 
                onCheckedChange={() => handleToggle(quote.id)}
                className="mt-1" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed line-clamp-2">{quote.quote}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {quote.citation || "Unknown"}
                      </Badge>
                      {quote.source && (
                        <Badge variant="outline" className="text-xs">
                          {quote.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
