import { CreateImage } from "@/components/sections/memorials/create-image";
import { ImageResult } from "@/components/sections/memorials/image-results";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { db } from "@/lib/db";
import {
  createMemorialImage,
  type MemorialTemplateKey,
} from "@/lib/db/mutations/media";
import {
  getEntryWithAccess,
  getEntryDetailsById,
} from "@/lib/db/queries/entries";
import { getSavedQuotesByEntryId } from "@/lib/db/queries/quotes";
import { UserUploadTable } from "@/lib/db/schema";
import type { PlacidImage, PlacidCardRequest } from "@/lib/services/placid";
import { fetchImage } from "@/lib/services/placid";
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

  const [savedQuotes, userUploads, entryDetails] = await Promise.all([
    getSavedQuotesByEntryId(entryId),
    db
      .select()
      .from(UserUploadTable)
      .where(eq(UserUploadTable.entryId, entryId)),
    getEntryDetailsById(entryId),
  ]);

  const createMemorialImageAction = async (
    formData: PlacidCardRequest,
    templateKey: MemorialTemplateKey,
    entryIdArg: string,
  ) => {
    "use server";
    return createMemorialImage(formData, templateKey, entryIdArg);
  };

  return (
    <div className="min-h-screen">
      <Link
        href={`/${entryId}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
        Back to Entry
      </Link>
      <div className="flex flex-col lg:flex-row items-center lg:items-start relative pb-12 lg:pb-24">
        <aside className="flex-none lg:flex-1/3 sticky lg:top-32 mt-4 order-2 lg:order-1">
          <CreateImage
            action={createMemorialImageAction}
            userId={userId}
            deceased={deceased}
            entryId={entryId}
            entryDetails={entryDetails}
            savedQuotes={savedQuotes}
            userUploads={userUploads}
          />
        </aside>
        <article className="flex-1 lg:flex-2/3 px-4 order-1 lg:order-2 flex">
          <Suspense fallback={<div>Loading...</div>}>
            {imageIds.length > 0 ? (
              <div className=" grid lg:grid-cols-2 gap-2 mx-auto my-4">
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
        </article>
      </div>
    </div>
  );
}
