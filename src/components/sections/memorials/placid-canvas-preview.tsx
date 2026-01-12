"use client";

import type { PlacidCardRequest } from "@/lib/services/placid";
import { templateIds } from "@/lib/services/placid";
import type { PlacidCanvasInstance, PlacidLayerValue } from "@/types/placid-sdk";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { TemplateKey } from "./template-selector";

interface PlacidCanvasPreviewProps {
  accessToken: string;
  templateKey: TemplateKey;
  formData: PlacidCardRequest;
  className?: string;
}

// Get template UUIDs for a template key (returns array for prayer card)
const getTemplateUuids = (templateKey: TemplateKey): { uuid: string; label: string }[] => {
  switch (templateKey) {
    case "bookmark":
      return [{ uuid: templateIds.bookmark, label: "Bookmark" }];
    case "prayerCard":
      return [
        { uuid: templateIds.prayerCardFront, label: "Front" },
        { uuid: templateIds.prayerCardBack, label: "Back" },
      ];
    case "singlePageMemorial":
      return [{ uuid: templateIds.singlePageMemorial, label: "Memorial" }];
    case "thankyouCard":
      return [{ uuid: templateIds.thankyouCard, label: "Thank You Card" }];
    default:
      return [{ uuid: templateIds.bookmark, label: "Preview" }];
  }
};

// Get approximate aspect ratio for placeholder during loading
// These are estimates to prevent layout shift - actual canvas may differ slightly
const getPlaceholderAspectRatio = (templateUuid: string): string => {
  switch (templateUuid) {
    case templateIds.bookmark:
      return "aspect-[1/2.8]"; // Tall bookmark shape
    case templateIds.prayerCardFront:
    case templateIds.prayerCardBack:
      return "aspect-[3/4]"; // Standard card shape
    case templateIds.singlePageMemorial:
      return "aspect-[8.5/11]"; // Letter paper shape
    case templateIds.thankyouCard:
      return "aspect-[4/3]"; // Landscape card shape
    default:
      return "aspect-[3/4]";
  }
};

// Convert form data to Placid layer format based on template UUID
const getLayersForTemplateUuid = (
  templateUuid: string,
  formData: PlacidCardRequest
): Record<string, PlacidLayerValue> => {
  const textColor = formData.text_color || "#FFFFFF";

  // Prayer Card Back has different layers
  if (templateUuid === templateIds.prayerCardBack) {
    return {
      service: { text: formData.service, text_color: textColor },
      overlay: { background_color: formData.overlay },
      background_image: { image: formData.background_image },
      prayer: { text: formData.prayer, text_color: textColor },
    };
  }

  // All other templates share similar base layers
  const baseLayers: Record<string, PlacidLayerValue> = {
    portrait: { image: formData.portrait },
    name: { text: formData.name, text_color: textColor },
    birth: { text: formData.birth, text_color: textColor },
    death: { text: formData.death, text_color: textColor },
    overlay: { background_color: formData.overlay },
    background_image: { image: formData.background_image },
  };

  if (templateUuid === templateIds.bookmark) {
    return {
      ...baseLayers,
      excerpt: { text: formData.epitaph, text_color: textColor },
    };
  }

  if (templateUuid === templateIds.prayerCardFront) {
    return {
      ...baseLayers,
      epitaph: { text: formData.epitaph, text_color: textColor },
      icon: {
        image: formData.icon,
        hide: !formData.icon,
      },
    };
  }

  if (templateUuid === templateIds.singlePageMemorial) {
    return {
      ...baseLayers,
      obit_summary: { text: formData.obit_summary, text_color: textColor },
      service: { text: formData.service, text_color: textColor },
    };
  }

  if (templateUuid === templateIds.thankyouCard) {
    return {
      sign_off: { text: formData.sign_off, text_color: textColor },
      thank_you_message: { text: formData.thank_you_message, text_color: textColor },
      overlay: { background_color: formData.overlay },
      background_image: { image: formData.background_image },
    };
  }

  return baseLayers;
};

// Single canvas component
function SingleCanvas({
  accessToken,
  templateUuid,
  formData,
  label,
  sdkLoaded,
}: {
  accessToken: string;
  templateUuid: string;
  formData: PlacidCardRequest;
  label: string;
  sdkLoaded: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasInstanceRef = useRef<PlacidCanvasInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeCanvas = () => {
    if (!containerRef.current || !window.EditorSDK || !accessToken) {
      return;
    }

    // Clean up existing instance
    if (canvasInstanceRef.current) {
      try {
        canvasInstanceRef.current.destroy();
      } catch {
        // Ignore destroy errors
      }
      canvasInstanceRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const instance = window.EditorSDK.canvas.create(containerRef.current, {
        access_token: accessToken,
        template_uuid: templateUuid,
      });

      instance.on("canvas:ready", () => {
        setIsLoading(false);
        const layers = getLayersForTemplateUuid(templateUuid, formData);
        instance.fillLayers(layers);
      });

      instance.on("canvas:loaded", () => {
        setIsLoading(false);
      });

      canvasInstanceRef.current = instance;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize canvas");
      setIsLoading(false);
    }
  };

  // Initialize canvas when SDK loads or template changes
  useEffect(() => {
    if (sdkLoaded && accessToken) {
      initializeCanvas();
    }
  }, [sdkLoaded, accessToken, templateUuid]);

  // Update layers when form data changes
  useEffect(() => {
    if (canvasInstanceRef.current && !isLoading) {
      const layers = getLayersForTemplateUuid(templateUuid, formData);
      canvasInstanceRef.current.fillLayers(layers);
    }
  }, [formData, templateUuid, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvasInstanceRef.current) {
        try {
          canvasInstanceRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
      }
    };
  }, []);

  // Get the placeholder aspect ratio for this template
  const placeholderAspect = getPlaceholderAspectRatio(templateUuid);

  return (
    <div className="flex flex-col">
      <div 
        className={`relative w-full bg-muted rounded-lg overflow-hidden border border-border transition-all duration-300 ${
          isLoading ? placeholderAspect : ""
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Loading...
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <div className="text-center p-4">
              <p className="text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={initializeCanvas}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full"
          aria-label={`${label} preview canvas`}
        />
      </div>
      <p className="mt-1 text-xs text-center text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function PlacidCanvasPreview({
  accessToken,
  templateKey,
  formData,
  className,
}: PlacidCanvasPreviewProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const templates = getTemplateUuids(templateKey);
  const isMultiCanvas = templates.length > 1;

  if (sdkError) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg border border-border">
          <p className="text-sm text-destructive">Failed to load Placid SDK</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://sdk.placid.app/editor-sdk@latest/sdk.js"
        onLoad={() => setSdkLoaded(true)}
        onError={() => setSdkError(true)}
        strategy="lazyOnload"
      />
      <div className={className}>
        <div className={isMultiCanvas ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 3xl:grid-cols-2 gap-4" : ""}>
          {templates.map((template) => (
            <SingleCanvas
              key={template.uuid}
              accessToken={accessToken}
              templateUuid={template.uuid}
              formData={formData}
              label={template.label}
              sdkLoaded={sdkLoaded}
            />
          ))}
        </div>
        {!isMultiCanvas && (
          <p className="mt-2 text-xs text-center text-muted-foreground">
            Live Preview
          </p>
        )}
      </div>
    </>
  );
}
