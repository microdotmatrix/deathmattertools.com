"use client";

import type { MemorialTemplateKey } from "@/lib/db/mutations/media";
import type {
  Document,
  Entry,
  EntryDetails,
  SavedQuote,
  UserUpload,
} from "@/lib/db/schema";
import { getContrastingTextColor, type PlacidCardRequest } from "@/lib/services/placid";
import type { ActionState } from "@/lib/utils";
import { useState } from "react";
import { CreateImageForm } from "./create-image-form";
import { PlacidCanvasPreview } from "./placid-canvas-preview";
import type { TemplateKey } from "./template-selector";

interface CreateImageWithPreviewProps {
  action: (
    formData: PlacidCardRequest,
    templateKey: MemorialTemplateKey,
    entryId: string,
  ) => Promise<ActionState>;
  userId: string | null;
  deceased: Entry;
  entryId: string;
  entryDetails?: EntryDetails | null;
  savedQuotes?: SavedQuote[];
  userUploads?: UserUpload[];
  obituaries?: Document[];
  canvasToken?: string;
  hasGeneratedImages: boolean;
  children?: React.ReactNode; // For image results
}

export function CreateImageWithPreview({
  action,
  userId,
  deceased,
  entryId,
  entryDetails,
  savedQuotes = [],
  userUploads = [],
  obituaries = [],
  canvasToken,
  hasGeneratedImages,
  children,
}: CreateImageWithPreviewProps) {
  const [previewData, setPreviewData] = useState<{
    formData: PlacidCardRequest;
    templateKey: TemplateKey;
  } | null>(null);

  const handleFormDataChange = (formData: PlacidCardRequest, templateKey: TemplateKey) => {
    setPreviewData({ formData, templateKey });
  };

  // Compute text color for canvas preview based on overlay
  const formDataWithTextColor = previewData
    ? {
        ...previewData.formData,
        text_color: previewData.formData.overlay
          ? getContrastingTextColor(previewData.formData.overlay)
          : "#FFFFFF",
      }
    : null;

  const showPreview = canvasToken && !hasGeneratedImages && previewData;

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start relative pb-12 lg:pb-24">
      {/* Form - Left Column */}
      <aside className="flex-none lg:flex-1/4 sticky lg:top-32 mt-4">
        <CreateImageForm
          action={action}
          userId={userId}
          deceased={deceased}
          entryId={entryId}
          entryDetails={entryDetails}
          savedQuotes={savedQuotes}
          userUploads={userUploads}
          obituaries={obituaries}
          onFormDataChange={handleFormDataChange}
        />
      </aside>

      {/* Preview / Results - Right Column */}
      <article className="flex-1 lg:flex-3/4 px-4 flex justify-center">
        {hasGeneratedImages ? (
          children
        ) : showPreview ? (
          <div className="sticky top-6 self-start w-full pt-8 lg:pt-0">
            <PlacidCanvasPreview
              accessToken={canvasToken}
              templateKey={previewData.templateKey}
              formData={formDataWithTextColor!}
              className="w-full"
            />
          </div>
        ) : (
          children
        )}
      </article>
    </div>
  );
}
