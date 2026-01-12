"use client";

import { ImageDialog } from "@/components/elements/image-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { deleteImageAction } from "@/actions/images";
import { downloadImage } from "@/lib/helpers";
import type { PlacidImage } from "@/lib/services/placid";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ShareDialog } from "@/components/sections/share/share-dialog";

interface EpitaphThumbnailProps {
  image: PlacidImage;
  entryId: string;
  /** Database image ID for sharing (optional, sharing disabled if not provided) */
  imageId?: string;
  /** Whether the current user can share this image */
  canShare?: boolean;
}

export const EpitaphThumbnail = ({
  image,
  entryId,
  imageId,
  canShare = false,
}: EpitaphThumbnailProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteImageAction(image.id.toString(), entryId);

      if (result.success) {
        toast.success("Image deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    });
  };

  return (
    <figure className="relative overflow-hidden aspect-square">
      <ImageDialog
        src={image?.image_url}
        alt="Generated epitaph"
        className="cursor-pointer"
      />
      <figcaption className="absolute top-0.5 right-0.5 z-10 flex items-center justify-center gap-1">
        {canShare && imageId && (
          <ShareDialog
            type="image"
            resourceId={imageId}
            entryId={entryId}
            trigger={
              <Button
                variant="ghost"
                className="p-1.5 rounded-md bg-background opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Share Image"
              >
                <Icon icon="mdi:share-variant" className="size-4" />
              </Button>
            }
          />
        )}
        <Button
          variant="ghost"
          className="p-1.5 rounded-md bg-background opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          disabled={isPending}
          onClick={() => downloadImage(image.image_url, `epitaph-${image.id}`)}
          aria-label="Download Image"
        >
          <Icon icon="carbon:download" className="size-4" />
        </Button>
        <Button
          variant="ghost"
          className="p-1.5 rounded-md bg-background opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          disabled={isPending}
          onClick={handleDelete}
          aria-label="Delete Image"
        >
          {isPending ? (
            <Icon icon="mdi:loading" className="animate-spin size-4" />
          ) : (
            <Icon icon="mdi:close" className="size-4" />
          )}
        </Button>
      </figcaption>
    </figure>
  );
};