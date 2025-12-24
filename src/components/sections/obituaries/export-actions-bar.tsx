"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markdownToHtml } from "@/lib/markdown-converter";
import React, { type RefObject, useState } from "react";
import { toast } from "sonner";

interface ExportActionsBarProps {
  /** Markdown content for copy operation */
  content: string;
  /** DOM ref for PDF generation */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Entry name for PDF filename and header */
  entryName?: string;
  /** Creation date for PDF header */
  createdAt?: Date;
  /** Disable all actions (e.g., during edit mode) */
  disabled?: boolean;
}

export const ExportActionsBar = ({
  content,
  contentRef,
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

  // Generate and download PDF
  const handleSavePDF = async () => {
    if (!contentRef.current) {
      toast.error("Content not available for PDF generation");
      return;
    }

    setIsGeneratingPDF(true);
    const loadingToast = toast.loading("Generating PDF...");

    try {
      // Dynamic import to reduce bundle size
      const html2pdf = (await import("html2pdf.js")).default;

      // Create a temporary container for PDF with header and footer
      const pdfContainer = document.createElement("div");
      pdfContainer.className = "pdf-export-container";

      // Format date for header
      const dateStr = createdAt
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(createdAt)
        : "";

      // Build PDF content with header and footer
      pdfContainer.innerHTML = `
        <div style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.6;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e5e5;">
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a;">
              In Loving Memory
            </h1>
            <h2 style="font-size: 20px; font-weight: 500; margin: 0 0 8px 0; color: #333;">
              ${escapeHtml(entryName)}
            </h2>
            ${dateStr ? `<p style="font-size: 12px; color: #666; margin: 0;">Created: ${dateStr}</p>` : ""}
          </div>
          
          <!-- Content -->
          <div style="font-size: 14px; text-align: justify;">
            ${markdownToHtml(content)}
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="font-size: 10px; color: #888; margin: 0;">
              Created with <a href="https://deathmattertools.com" style="color: #666; text-decoration: underline;">Death Matter Tools</a>
            </p>
          </div>
        </div>
      `;

      // Sanitize filename
      const safeFilename = entryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const options = {
        margin: [0.75, 0.75, 0.75, 0.75] as [number, number, number, number],
        filename: `${safeFilename}-obituary.pdf`,
        image: { type: "jpeg" as const, quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: {
          unit: "in" as const,
          format: "letter" as const,
          orientation: "portrait" as const,
        },
        pagebreak: { mode: ["avoid-all", "css"] },
      };

      await html2pdf().set(options).from(pdfContainer).save();

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

// Helper to escape HTML for safe insertion
const escapeHtml = (str: string): string => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};
