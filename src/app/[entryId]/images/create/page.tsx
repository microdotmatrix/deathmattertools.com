import { CreateImageWithPreview } from "@/components/sections/memorials/create-image-client";
import { ImageResult } from "@/components/sections/memorials/image-results";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { db } from "@/lib/db";
import {
    createMemorialImage,
    type MemorialTemplateKey,
} from "@/lib/db/mutations/media";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import {
    getEntryDetailsById,
    getEntryWithAccess,
} from "@/lib/db/queries/entries";
import { getSavedQuotesByEntryId } from "@/lib/db/queries/quotes";
import { UserUploadTable } from "@/lib/db/schema";
import type { PlacidCardRequest, PlacidImage } from "@/lib/services/placid";
import { fetchImage } from "@/lib/services/placid";
import { getCanvasToken } from "@/lib/services/placid-canvas";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export async function getEpitaphImage(id: number) {
  try {
    if (!id) return null;

    const imageData = await fetchImage(id);
    return imageData;
  } catch (error) {
    console.error("Error fetching epitaph image:", error);
    return null;
  }
}

export default async function Create({
  params,
  searchParams,
}: {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { entryId } = await params;
  const { id } = await searchParams;
  const imageIds = id ? id.split(",").map((id) => Number(id)) : [];

  let images: PlacidImage[] = [];

  if (imageIds.length > 0) {
    images = (await Promise.all(
      imageIds.map(async (id) => await getEpitaphImage(id)),
    )) as PlacidImage[];
  }
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const access = await getEntryWithAccess(entryId);

  if (!access) {
    notFound();
  }

  if (access.role !== "owner") {
    redirect(`/${entryId}/images`);
  }

  const deceased = access.entry;

  const [savedQuotes, userUploads, entryDetails, canvasTokenData, documents] = await Promise.all([
    getSavedQuotesByEntryId(entryId),
    db
      .select()
      .from(UserUploadTable)
      .where(eq(UserUploadTable.entryId, entryId)),
    getEntryDetailsById(entryId),
    getCanvasToken().catch(() => null),
    getDocumentsByEntryId(entryId),
  ]);

  // Filter to only obituaries (not eulogies)
  const obituaries = documents.filter((doc) => doc.kind === "obituary");

  const createMemorialImageAction = async (
    formData: PlacidCardRequest,
    templateKey: MemorialTemplateKey,
    entryIdArg: string,
  ) => {
    "use server";
    return createMemorialImage(formData, templateKey, entryIdArg);
  };

  const hasGeneratedImages = imageIds.length > 0;

  return (
    <div className="min-h-screen">
      <Link
        href={`/${entryId}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
        Back to Entry
      </Link>
      
      <CreateImageWithPreview
        action={createMemorialImageAction}
        userId={userId}
        deceased={deceased}
        entryId={entryId}
        entryDetails={entryDetails}
        savedQuotes={savedQuotes}
        userUploads={userUploads}
        obituaries={obituaries}
        canvasToken={canvasTokenData?.token}
        hasGeneratedImages={hasGeneratedImages}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {hasGeneratedImages ? (
            <div className="grid lg:grid-cols-2 gap-2 mx-auto my-4">
              {images &&
                images.map((image) => (
                  <ImageResult
                    key={image.id}
                    id={image.id}
                    initialImageData={image}
                  />
                ))}
            </div>
          ) : (
            <div className="grid place-content-center w-full relative">
              <div className="flex flex-col lg:flex-row items-center gap-4 pt-12 lg:pt-24 relative top-0 lg:top-full">
                <Icon
                  icon="line-md:arrow-left"
                  className="size-8 hidden lg:block mt-0.5"
                />
                <h6 className="text-center text-foreground/75">
                  <span className="starting:opacity-0 opacity-100 transition-all duration-1000 delay-1500">
                    Complete the form
                  </span>{" "}
                  <span className="starting:opacity-0 opacity-100 transition-all duration-1000 delay-2500">
                    to generate a new image
                  </span>
                </h6>
                <Icon
                  icon="line-md:arrow-down"
                  className="size-8 lg:hidden"
                />
              </div>
            </div>
          )}
        </Suspense>
      </CreateImageWithPreview>
    </div>
  );
}
