"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

interface ExportActionsBarProps {
  /** Markdown content for copy and PDF operations */
  content: string;
  /** Entry name for PDF filename and header */
  entryName?: string;
  /** Creation date for PDF header */
  createdAt?: Date;
  /** Disable all actions (e.g., during edit mode) */
  disabled?: boolean;
}

export const ExportActionsBar = ({
  content,
  entryName = "Obituary",
  createdAt,
  disabled = false,
}: ExportActionsBarProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Copy plain text content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Obituary copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Trigger browser print dialog
  const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.print();
  };

  // Generate and download PDF using jsPDF directly (no html2canvas - avoids oklch/lab color issues)
  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    const loadingToast = toast.loading("Generating PDF...");

    try {
      // Dynamic import jsPDF directly
      const { jsPDF } = await import("jspdf");

      // Create PDF document (letter size: 8.5 x 11 inches)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 54; // 0.75 inch margins
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Format date for header
      const dateStr = createdAt
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(createdAt)
        : "";

      // Helper to add text with word wrapping and page breaks
      const addText = (
        text: string,
        fontSize: number,
        options: {
          bold?: boolean;
          italic?: boolean;
          align?: "left" | "center" | "right" | "justify";
          color?: [number, number, number];
          lineHeight?: number;
        } = {}
      ) => {
        const {
          bold = false,
          italic = false,
          align = "left",
          color = [26, 26, 26],
          lineHeight = 1.5,
        } = options;

        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);

        // Set font style
        let fontStyle = "normal";
        if (bold && italic) fontStyle = "bolditalic";
        else if (bold) fontStyle = "bold";
        else if (italic) fontStyle = "italic";
        doc.setFont("times", fontStyle);

        // Split text into lines that fit the content width
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeightPt = fontSize * lineHeight;

        for (const line of lines) {
          // Check if we need a new page
          if (y + lineHeightPt > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }

          let x = margin;
          if (align === "center") {
            x = pageWidth / 2;
          } else if (align === "right") {
            x = pageWidth - margin;
          }

          doc.text(line, x, y, { align });
          y += lineHeightPt;
        }

        return y;
      };

      // Helper to add spacing
      const addSpace = (pts: number) => {
        y += pts;
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Helper to add a horizontal line
      const addLine = () => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
      };

      // --- HEADER ---
      addText("In Loving Memory", 20, { bold: true, align: "center" });
      addSpace(8);
      addText(entryName, 16, { align: "center", color: [51, 51, 51] });
      if (dateStr) {
        addSpace(4);
        addText(`Created: ${dateStr}`, 10, {
          align: "center",
          color: [102, 102, 102],
        });
      }
      addSpace(12);
      addLine();
      addSpace(8);

      // --- CONTENT ---
      // Parse markdown content and render as text
      // Simple markdown parser for common elements
      const lines = content.split("\n");
      let inList = false;

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines but add spacing
        if (!trimmed) {
          if (inList) {
            inList = false;
            addSpace(8);
          } else {
            addSpace(12);
          }
          continue;
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          addText(trimmed.slice(4), 13, { bold: true });
          addSpace(4);
        } else if (trimmed.startsWith("## ")) {
          addSpace(8);
          addText(trimmed.slice(3), 14, { bold: true });
          addSpace(4);
        } else if (trimmed.startsWith("# ")) {
          addSpace(8);
          addText(trimmed.slice(2), 16, { bold: true });
          addSpace(4);
        }
        // Blockquotes
        else if (trimmed.startsWith("> ")) {
          addText(trimmed.slice(2), 11, { italic: true, color: [80, 80, 80] });
        }
        // Unordered list items
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          inList = true;
          addText(`• ${trimmed.slice(2)}`, 11, { align: "left" });
        }
        // Ordered list items
        else if (/^\d+\.\s/.test(trimmed)) {
          inList = true;
          addText(trimmed, 11, { align: "left" });
        }
        // Horizontal rule
        else if (trimmed === "---" || trimmed === "***") {
          addSpace(8);
          addLine();
        }
        // Regular paragraph - strip markdown formatting
        else {
          const cleanText = trimmed
            .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
            .replace(/\*(.+?)\*/g, "$1") // Italic
            .replace(/_(.+?)_/g, "$1") // Italic alt
            .replace(/`(.+?)`/g, "$1") // Code
            .replace(/\[(.+?)\]\(.+?\)/g, "$1"); // Links

          addText(cleanText, 11, { align: "justify" });
        }
      }

      // --- FOOTER ---
      addSpace(24);
      addLine();
      addSpace(4);
      addText("Created with Death Matter Tools", 9, {
        align: "center",
        color: [136, 136, 136],
      });

      // Generate safe filename and save
      const safeFilename = entryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      doc.save(`${safeFilename}-obituary.pdf`);

      toast.dismiss(loadingToast);
      toast.success("PDF saved successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share button placeholder
  const handleShare = () => {
    toast.info("Share functionality coming soon", {
      description: "This feature is currently in development.",
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 print:hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={disabled}
            aria-label="Copy obituary to clipboard"
            className="gap-2"
          >
            <Icon icon="lucide:copy" className="size-4" />
            <span className="sr-only">Copy</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy text to clipboard</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handlePrint(e)}
            disabled={disabled}
            aria-label="Print obituary"
            className="gap-2"
          >
            <Icon icon="lucide:printer" className="size-4" />
            <span className="sr-only">Print</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open print dialog</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSavePDF}
            disabled={disabled || isGeneratingPDF}
            aria-label="Save obituary as PDF"
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <>
                <Icon icon="lucide:loader-2" className="size-4 animate-spin" />
                <span className="sr-only">Generating...</span>
              </> 
            ) : (
              <>
                <Icon icon="lucide:file-down" className="size-4" />
                <span className="sr-only">Save PDF</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download as PDF file</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={disabled}
            aria-label="Share obituary"
            className="gap-2"
          >
            <Icon icon="lucide:share-2" className="size-4" />
            <span className="sr-only">Share</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share (coming soon)</TooltipContent>
      </Tooltip>
    </div>
  );
};

