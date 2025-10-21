"use client";

import { ImageUpload } from "@/components/elements/form/image-upload";
import { useUploadThing } from "@/components/elements/uploads";
import { deleteEntryImage } from "@/lib/db/mutations/images";
import { setPrimaryImageAction } from "@/lib/db/mutations/entries";
import { UserUpload } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface EntryImageUploadProps {
  entryId: string;
  initialImages?: UserUpload[];
  className?: string;
  readOnly?: boolean;
  currentPrimaryImage?: string;
}

export const EntryImageUpload = ({
  entryId,
  initialImages = [],
  className,
  readOnly = false,
  currentPrimaryImage,
}: EntryImageUploadProps) => {
  const router = useRouter();
  const [images, setImages] = useState<UserUpload[]>(initialImages);
  const [settingPrimary, setSettingPrimary] = useState(false);

  // Convert UserUpload objects to URL strings for ImageUpload component
  const imageUrls = images.map((img) => img.url);

  const { startUpload, isUploading } = useUploadThing("entryGalleryImage", {
    onClientUploadComplete: (res) => {
      // Add newly uploaded images to local state
      const newImages = res.map((file) => ({
        id: file.serverData.id,
        userId: "", // Will be filled by the server
        entryId: entryId,
        url: file.serverData.url,
        key: file.key,
        isPrimary: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      setImages((prev) => [...prev, ...newImages]);
      toast.success(`Successfully uploaded ${res.length} image(s)`);
      router.refresh();
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload images");
    },
  });

  const handleUpload = async (files: File[]) => {
    try {
      await startUpload(files, { entryId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    }
  };

  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];

    try {
      const result = await deleteEntryImage(imageToRemove.id, entryId);

      if (result.success) {
        setImages((prev) => prev.filter((_, i) => i !== index));
        toast.success("Image deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleSetPrimary = async (index: number) => {
    const imageToSet = images[index];
    setSettingPrimary(true);

    try {
      const result = await setPrimaryImageAction(entryId, imageToSet.url);

      if (result.success) {
        toast.success("Primary image updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to set primary image");
      }
    } catch (error) {
      console.error("Set primary error:", error);
      toast.error("Failed to set primary image");
    } finally {
      setSettingPrimary(false);
    }
  };

  return (
    <ImageUpload
      onUpload={handleUpload}
      onRemove={handleRemove}
      onSetPrimary={!readOnly ? handleSetPrimary : undefined}
      images={imageUrls}
      currentPrimaryImage={currentPrimaryImage}
      maxFiles={20}
      maxSize={10}
      className={className}
      disabled={isUploading || settingPrimary}
      readOnly={readOnly}
    />
  );
};