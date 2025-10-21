"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Quote, BookmarkCheck } from "lucide-react";
import type { SavedQuote } from "@/lib/db/schema";

interface SavedQuoteSelectorProps {
  quotes: SavedQuote[];
  onSelect: (quote: SavedQuote) => void;
  disabled?: boolean;
}

export function SavedQuoteSelector({ quotes, onSelect, disabled }: SavedQuoteSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (quote: SavedQuote) => {
    onSelect(quote);
    setOpen(false);
  };

  if (quotes.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-full"
        >
          <BookmarkCheck className="w-4 h-4 mr-2" />
          Select from Saved Quotes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Saved Quote</DialogTitle>
          <DialogDescription>
            Choose from your saved quotes and scripture to use as an epitaph.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {quotes.map((quote) => {
              const icon = quote.type === "scripture" ? BookOpen : Quote;
              const Icon = icon;

              return (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => handleSelect(quote)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed">{quote.quote}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {quote.citation || "Unknown"}
                        </Badge>
                        {quote.source && (
                          <Badge variant="outline" className="text-xs">
                            {quote.source}
                          </Badge>
                        )}
                        {quote.faith && (
                          <Badge variant="outline" className="text-xs">
                            {quote.faith}
                          </Badge>
                        )}
                        {quote.reference && (
                          <Badge variant="outline" className="text-xs">
                            {quote.reference}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
