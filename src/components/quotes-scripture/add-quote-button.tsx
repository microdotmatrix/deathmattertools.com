"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchDialog } from "./search-dialog";

interface AddQuoteButtonProps {
  entryId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddQuoteButton({ 
  entryId, 
  variant = "default",
  size = "sm"
}: AddQuoteButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Quote
      </Button>

      <SearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entryId={entryId}
      />
    </>
  );
}
