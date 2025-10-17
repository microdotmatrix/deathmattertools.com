"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Quote, Check } from "lucide-react";
import { saveQuoteAction } from "@/lib/db/mutations/quotes";
import { toast } from "sonner";
import type { UnifiedSearchResult } from "@/lib/api/saved-content";

interface SearchResultCardProps {
  result: UnifiedSearchResult;
  entryId: string;
  onSaved?: () => void;
}

export function SearchResultCard({ result, entryId, onSaved }: SearchResultCardProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    const formData = new FormData();
    formData.append("entryId", entryId);
    formData.append("quote", result.content);
    formData.append("citation", result.citation);
    formData.append("source", result.source);
    formData.append("type", result.type);
    formData.append("length", result.length);
    
    if (result.metadata?.faith) {
      formData.append("faith", result.metadata.faith);
    }
    if (result.metadata?.book) {
      formData.append("book", result.metadata.book);
    }
    if (result.metadata?.reference) {
      formData.append("reference", result.metadata.reference);
    }

    const response = await saveQuoteAction({} as any, formData);
    
    setSaving(false);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      setSaved(true);
      toast.success("Saved successfully!");
      onSaved?.();
    }
  };

  const icon = result.type === "scripture" ? BookOpen : Quote;
  const Icon = icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed">{result.content}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {result.citation}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {result.source}
              </Badge>
              {result.metadata?.faith && (
                <Badge variant="outline" className="text-xs">
                  {result.metadata.faith}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || saved}
          className="ml-auto"
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            saving ? "Saving..." : "Save"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
