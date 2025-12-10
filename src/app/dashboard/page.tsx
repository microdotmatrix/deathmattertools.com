import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { CreatePortal } from "@/components/sections/dashboard/create-dialog";
import { CreateEntryForm } from "@/components/sections/dashboard/create-form";
import { CreateEntryImage } from "@/components/sections/dashboard/create-image";
import { ActionButtons } from "@/components/sections/dashboard/entry-action-buttons";
import { UserStats } from "@/components/sections/dashboard/user-stats";
import { PageContentSkeleton } from "@/components/skeletons/page";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { EntryWithObituaries, getOrganizationEntries, getUserUploads } from "@/lib/db/queries/entries";
import { getUserGeneratedImagesCount } from "@/lib/db/queries/media";
import { auth } from "@clerk/nextjs/server";
import { differenceInYears, format } from "date-fns";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your memorial entries, view workspace activity, and create new obituaries and images.",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="grid h-full place-items-center">
        <article className="max-w-lg mx-auto space-y-8 text-center">
          <h1>Access Denied</h1>
          <p>
            You must have an account to access our tools. Please{" "}
            <Link href="/sign-in">sign in</Link>, or{" "}
            <Link href="/sign-up">create an account</Link> to get started.
          </p>
        </article>
      </main>
    );
  }

  return (
    <DashboardShell>
      <Suspense fallback={<PageContentSkeleton />}>
        <PageContent />
      </Suspense>
    </DashboardShell>
  );
}

const PageContent = async () => {
  const { userId } = await auth();
  const entries = await getOrganizationEntries();
  const uploads = await getUserUploads();
  const hasEntries = entries.length > 0;

  if (!userId) {
    return null;
  }
  
  // Separate owned entries from team entries
  const myEntries = entries.filter((entry) => entry.userId === userId);
  const teamEntries = entries.filter((entry) => entry.userId !== userId);

  // Use the user's most recent entry for the featured spot
  const featuredEntry = myEntries.at(0) ?? null;
  const libraryEntries = entries.filter((entry) => entry.id !== featuredEntry?.id);
  const myLibraryEntries = libraryEntries.filter((entry) => entry.userId === userId);
  const teamLibraryEntries = libraryEntries.filter((entry) => entry.userId !== userId);

  // Calculate server-side date stats to avoid hydration mismatch
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate entries this month on server side
  const entriesThisMonth = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    return (
      entryDate.getMonth() === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  }).length;

  let featuredEntryStats = null;
  if (featuredEntry) {
    const [obituaries, imagesCount] = await Promise.all([
      getDocumentsByEntryId(featuredEntry.id),
      getUserGeneratedImagesCount(featuredEntry.userId!, featuredEntry.id),
    ]);
    featuredEntryStats = {
      obituariesCount: obituaries.length,
      imagesCount: imagesCount,
    };
  }

  const header = (
    <DashboardHeader
      title="Dashboard"
      description={
        hasEntries
          ? "Review your latest memorial activity and keep your workspace organized."
          : "Create your first memorial entry to start building your workspace."
      }
      actions={<CreatePortal />}
    />
  );

  if (!hasEntries) {
    return (
      <div className="space-y-8">
        {header}
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Card className="border-dashed">
            <CardContent className="p-6">
              <CreateEntryForm />
            </CardContent>
          </Card>
          <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
            <CreateEntryImage />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      <section className="rounded-3xl border bg-card/60 shadow-sm">
        <FeaturedEntryCard entry={featuredEntry} stats={featuredEntryStats} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Entries
              </p>
              <h2 className="text-xl font-semibold">Workspace Library</h2>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[0.75rem]">
              {entries.length} Total
            </Badge>
          </div>
          {libraryEntries.length > 0 ? (
            <EntryListTabs
              userId={userId}
              allEntries={libraryEntries}
              myEntries={myLibraryEntries}
              teamEntries={teamLibraryEntries}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No additional entries yet. Create a new entry to grow your workspace.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Insights
            </p>
            <h2 className="text-xl font-semibold">Workspace Stats</h2>
          </div>
          <UserStats
            entries={entries}
            uploads={uploads}
            entriesThisMonth={entriesThisMonth}
          />
        </div>
      </div>
    </div>
  );
};

const FeaturedEntryCard = async ({
  entry,
  stats,
}: {
  entry: EntryWithObituaries | null;
  stats: { obituariesCount: number; imagesCount: number } | null;
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
        <Image
          src={entry.image ?? "/images/create-entry_portrait-01.png"}
          alt={entry.name}
          fill
          priority
          className="size-full object-cover object-center"
        />
      </figure>

      {/* Content Section - Right Half */}
      <div className="col-span-7 p-8 flex flex-col justify-center space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Most Recent
            </p>
            {!isOwnEntry && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="flex items-center gap-1 cursor-help">
                      <Icon icon="mdi:account-group" className="w-3 h-3" />
                      Team Entry
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This entry was created by a member of your organization</p>
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

        <div className="flex flex-wrap items-center gap-3">
          <ActionButtons entry={entry} />
        </div>
      </div>
    </Card>
  );
};

const EntryListTabs = ({
  allEntries,
  myEntries,
  teamEntries,
  userId,
}: {
  allEntries: EntryWithObituaries[];
  myEntries: EntryWithObituaries[];
  teamEntries: EntryWithObituaries[];
  userId: string;
}) => {
  const tabs = [
    {
      value: "all",
      label: "All Entries",
      description: "Everything across your workspace, newest to oldest.",
      entries: allEntries,
      emptyMessage: "No additional entries yet."
    },
    {
      value: "my-entries",
      label: "My Entries",
      description: "Entries you created personally.",
      entries: myEntries,
      emptyMessage: "You haven’t created any other entries yet."
    },
    {
      value: "team-entries",
      label: "Team Entries",
      description: "Entries created by organization members.",
      entries: teamEntries,
      emptyMessage: "No team entries yet. They’ll appear here once your team contributes."
    },
  ];

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/60 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex min-w-32 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-center text-sm font-semibold leading-tight data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <span>{tab.label} ({tab.entries.length})</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">{tab.description}</p>
          <EntryList
            entries={tab.entries}
            emptyMessage={tab.emptyMessage}
            userId={userId}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

const EntryList = ({
  entries,
  emptyMessage,
  userId,
}: {
  entries: EntryWithObituaries[];
  emptyMessage: string;
  userId: string;
}) => {
  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} isOwnEntry={entry.userId === userId} />
      ))}
    </div>
  );
};

const EntryRow = ({ entry, isOwnEntry }: { entry: EntryWithObituaries; isOwnEntry: boolean }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-border">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-4">
          <div className="relative size-24 xl:size-32 2xl:size-24 overflow-hidden rounded-xl bg-muted shrink-0">
            <Image
              src={entry.image ?? "/images/create-entry_portrait-01.png"}
              alt={entry.name}
              fill
              priority
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${entry.id}`} className="font-semibold leading-tight">
                {entry.name}
              </Link>
              <Badge variant={isOwnEntry ? "default" : "outline"} className="text-xs">
                {isOwnEntry ? "My Entry" : "Team"}
              </Badge>
            </div>
            {entry.locationBorn && (
              <p className="text-sm text-muted-foreground truncate">
                {entry.locationBorn}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              {entry.dateOfBirth
                ? format(new Date(entry.dateOfBirth), "MMM d, yyyy")
                : ""}
              <span className="px-1">—</span>
              {entry.dateOfDeath
                ? format(new Date(entry.dateOfDeath), "MMM d, yyyy")
                : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          {isOwnEntry ? (
            <ActionButtons entry={entry} />
          ) : (
            <Link
              href={`/${entry.id}`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full md:w-auto",
              })}
            >
              <Icon icon="mdi:eye" className="mr-2 size-4" />
              View Entry
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};



