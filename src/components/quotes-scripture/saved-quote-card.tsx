"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, Quote, Trash2, CheckCircle2 } from "lucide-react";
import { deleteQuoteAction } from "@/lib/db/mutations/quotes";
import { toast } from "sonner";
import type { SavedQuote } from "@/lib/db/schema";

interface SavedQuoteCardProps {
  quote: SavedQuote;
}

export function SavedQuoteCard({ quote }: SavedQuoteCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    
    const response = await deleteQuoteAction(quote.id, quote.entryId);
    
    if (response.error) {
      toast.error(response.error);
      setDeleting(false);
    } else {
      toast.success("Quote deleted successfully");
      // The page will revalidate automatically
    }
    
    setShowDeleteDialog(false);
  };

  const icon = quote.type === "scripture" ? BookOpen : Quote;
  const Icon = icon;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-3">
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

              {(quote.usedInObituary || quote.usedInImage) && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {quote.usedInObituary && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Used in obituary</span>
                    </div>
                  )}
                  {quote.usedInImage && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Used in image</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The quote will be permanently removed from this entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
