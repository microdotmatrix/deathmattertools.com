"use server";

import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env/server";
import type {
  PexelsImage,
  PexelsPhoto,
  PexelsSearchResponse,
} from "@/lib/api/types";

const PEXELS_API_URL = "https://api.pexels.com/v1";
const PER_PAGE = 24;
const MAX_IMAGES = 200;

function mapPexelsPhoto(photo: PexelsPhoto): PexelsImage {
  return {
    id: photo.id.toString(),
    url: photo.src.large,
    thumbnailUrl: photo.src.medium,
    width: photo.width,
    height: photo.height,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    alt: `Photo by ${photo.photographer}`,
  };
}

export async function searchPexelsImagesAction(
  query: string,
  page: number = 1
): Promise<{
  success: boolean;
  images?: PexelsImage[];
  total?: number;
  hasMore?: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!query || query.trim().length === 0) {
      return { success: false, error: "Search query is required" };
    }

    if (page < 1 || page > Math.ceil(MAX_IMAGES / PER_PAGE)) {
      return { success: false, error: "Invalid page number" };
    }

    const sanitizedQuery = query.trim().slice(0, 100);

    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(sanitizedQuery)}&page=${page}&per_page=${PER_PAGE}`,
      {
        headers: {
          Authorization: env.PEXELS_API_KEY,
        },
        next: {
          revalidate: 3600,
          tags: ["pexels", `pexels:${sanitizedQuery}`],
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: "Rate limit exceeded. Please try again later." };
      }
      throw new Error(`Pexels API returned ${response.status}`);
    }

    const data: PexelsSearchResponse = await response.json();
    const images = data.photos.map(mapPexelsPhoto);
    const currentTotal = (page - 1) * PER_PAGE + images.length;
    const hasMore = currentTotal < Math.min(data.total_results, MAX_IMAGES) && images.length === PER_PAGE;

    return {
      success: true,
      images,
      total: Math.min(data.total_results, MAX_IMAGES),
      hasMore,
    };
  } catch (error) {
    console.error("Pexels search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search images",
    };
  }
}
