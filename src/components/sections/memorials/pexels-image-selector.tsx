"use client";

import { searchPexelsImagesAction } from "@/actions/pexels";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PexelsImage } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface PexelsImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
  defaultQuery?: string;
}

export function PexelsImageSelector({
  open,
  onOpenChange,
  onSelect,
  defaultQuery = "inspiration",
}: PexelsImageSelectorProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultQuery);
  const [images, setImages] = useState<PexelsImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== debouncedQuery) {
        setDebouncedQuery(searchQuery);
        setPage(1);
        setImages([]);
        setHasMore(true);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedQuery]);

  // Fetch images when query or page changes
  useEffect(() => {
    if (!open || !debouncedQuery) return;

    const currentRequestId = ++requestIdRef.current;

    const fetchImages = async () => {
      setLoading(true);
      setError(null);

      const result = await searchPexelsImagesAction(debouncedQuery, page);

      // Ignore stale requests
      if (currentRequestId !== requestIdRef.current) return;

      if (result.success && result.images) {
        setImages((prev) =>
          page === 1 ? result.images! : [...prev, ...result.images!]
        );
        setHasMore(result.hasMore ?? false);
      } else {
        setError(result.error || "Failed to load images");
      }

      setLoading(false);
    };

    fetchImages();
  }, [debouncedQuery, page, open]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, debouncedQuery]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSearchQuery(defaultQuery);
        setDebouncedQuery(defaultQuery);
        setPage(1);
        setImages([]);
        setHasMore(true);
        setError(null);
        requestIdRef.current++;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, defaultQuery]);

  const handleImageSelect = useCallback(
    (image: PexelsImage) => {
      onSelect(image.url);
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  const suggestedKeywords = [
    "nature",
    "flowers",
    "sky",
    "ocean",
    "mountains",
    "peaceful",
    "sunset",
    "candles",
  ];

  const content = (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search for images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSearchQuery(keyword)}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive text-center">{error}</div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {images.length === 0 && !loading && !error && (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No images found. Try a different search term.
            </div>
          )}

          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => handleImageSelect(image)}
                className={cn(
                  "break-inside-avoid w-full relative overflow-hidden rounded-lg",
                  "border border-border hover:border-primary transition-all",
                  "hover:shadow-lg group focus:outline-none focus:ring-2 focus:ring-primary"
                )}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt={image.alt}
                  width={400}
                  height={Math.floor((400 * image.height) / image.width)}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">
                    {image.photographer}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Icon
                icon="mdi:loading"
                className="size-6 animate-spin text-muted-foreground"
              />
            </div>
          )}

          {hasMore && !loading && <div ref={sentinelRef} className="h-4" />}
        </div>
      </ScrollArea>

      <div className="p-3 border-t text-xs text-muted-foreground text-center">
        Photos provided by{" "}
        <a
          href="https://www.pexels.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Pexels
        </a>
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
      dismissible
    >
      <DrawerContent
        className={cn(
          "overflow-hidden",
          isMobile
            ? "h-[85vh]"
            : "h-full w-full data-[vaul-drawer-direction=right]:sm:max-w-xl"
        )}
      >
        <DrawerHeader className={isMobile ? "sr-only" : "p-4 border-b"}>
          <DrawerTitle>Select Stock Image</DrawerTitle>
          <DrawerDescription>
            Search and select an image from Pexels
          </DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
