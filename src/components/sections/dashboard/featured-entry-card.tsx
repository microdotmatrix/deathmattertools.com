import { CachedImage } from "@/components/elements/image-cache";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EntryWithObituaries } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { differenceInYears, format } from "date-fns";
import Link from "next/link";
import { CreatePortal } from "./create-dialog";
import { ActionButtons } from "./entry-action-buttons";

export const FeaturedEntryCard = async ({
  entry,
  stats,
  pendingFeedbackCount = 0,
}: {
  entry: EntryWithObituaries | null;
  stats: { obituariesCount: number; imagesCount: number } | null;
  pendingFeedbackCount?: number;
}) => {
  const { userId } = await auth();

  if (!entry) {
    return (
      <Card className="border-dashed bg-muted/20 p-8 text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Most Recent
        </p>
        <h3 className="text-2xl font-semibold">Create your first entry to feature it here</h3>
        <p className="text-muted-foreground">
          You don&apos;t have a personal entry yet. Once you create one, it will appear in this
          featured spot.
        </p>
        <div className="flex items-center justify-center gap-3">
          <CreatePortal />
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            <Icon icon="mdi:home-outline" className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </Card>
    );
  }

  const isOwnEntry = entry.userId === userId;

  return (
    <Card className="border-0 shadow-xl md:grid md:grid-cols-12 min-h-fit p-4">
      {/* Image Section - Left Half */}
      <figure className="relative md:col-span-5 shadow-xl dark:shadow-foreground/5 transition-shadow duration-200 rounded-lg overflow-clip aspect-square md:aspect-auto w-full max-h-130 md:max-h-136 3xl:max-h-180 3xl:aspect-4/3 max-w-full">
        <CachedImage
          src={entry.image!}
          alt={entry.name}
          height={600}
          width={800}
          className="w-full h-full object-cover"
        />
      </figure>

      {/* Content Section - Right Half */}
      <div className="col-span-7 px-8 py-4 flex flex-col justify-center space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Most Recent
            </p>
            {pendingFeedbackCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={`${pendingFeedbackCount} pending feedback items`}
                      className="inline-flex size-2.5 rounded-full bg-primary"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {pendingFeedbackCount} pending{" "}
                      {pendingFeedbackCount === 1 ? "feedback item" : "feedback items"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Link
            href={`/${entry.id}`}
            className="text-3xl font-display font-bold mb-2"
          >
            {entry.name}
          </Link>
          {entry.locationBorn && (
            <p className="text-lg text-muted-foreground mb-6">
              from {entry.locationBorn}
            </p>
          )}
        </div>

        <div className="space-y-1 h-full">
          <div className="flex items-center gap-4">
            <span className="font-medium">Born:</span>
            <span>
              {entry.dateOfBirth
                ? format(new Date(entry.dateOfBirth), "MMMM d, yyyy")
                : ""}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Deceased:</span>
            <span>
              {entry.dateOfDeath
                ? format(new Date(entry.dateOfDeath), "MMMM d, yyyy")
                : ""}
            </span>
          </div>
          {entry.dateOfBirth && entry.dateOfDeath && (
            <p className="text-sm text-muted-foreground">
              {differenceInYears(
                new Date(entry.dateOfDeath),
                new Date(entry.dateOfBirth)
              )}{" "}
              years old
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border bg-background/80 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Obituaries</p>
              <p className="text-lg font-semibold">
                {stats?.obituariesCount ?? 0}
              </p>
            </div>
            <Icon icon="mdi:feather" className="w-5 h-5 text-primary" />
          </div>
          <div className="rounded-xl border bg-background/80 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Memorial Images</p>
              <p className="text-lg font-semibold">
                {stats?.imagesCount ?? 0}
              </p>
            </div>
            <Icon icon="mdi:image-multiple-outline" className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <ActionButtons entry={entry} />
        </div>
      </div>
    </Card>
  );
};
