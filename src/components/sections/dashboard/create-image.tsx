"use client";

import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEntryImage } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface CreateEntryImageProps {
  uploadedImages?: string[];
}

export const CreateEntryImage = ({ uploadedImages = [] }: CreateEntryImageProps) => {
  const { image, setImage, uploading } = useEntryImage();
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState<string | null>(image);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImage(imageUrl);
  };

  const displayImage = selectedImage || image || "/images/create-entry_portrait-01.png";

  return (
    <div className="space-y-4">
      {/* Main Image Preview */}
      <motion.figure
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "w-full lg:max-w-[75%] mx-auto relative h-full overflow-hidden aspect-square rounded-lg border border-border",
          isMobile && "w-full h-80"
        )}
      >
        <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-muted">
          Preview
        </Badge>
        <Image
          src={displayImage}
          alt="Create Entry"
          fill
          className="object-cover object-center size-full"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}
      </motion.figure>

      {/* Image Selection Thumbnails */}
      {uploadedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Select Image ({uploadedImages.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {uploadedImages.map((imageUrl, index) => (
              <motion.button
                key={imageUrl}
                type="button"
                onClick={() => handleImageSelect(imageUrl)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                  selectedImage === imageUrl || (image === imageUrl && !selectedImage)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Image
                  src={imageUrl}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {(selectedImage === imageUrl || (image === imageUrl && !selectedImage)) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                    <div className="bg-primary rounded-full p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};