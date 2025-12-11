import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { CreatePortal } from "@/components/sections/dashboard/create-dialog";
import { CreateEntryForm } from "@/components/sections/dashboard/create-form";
import { CreateEntryImage } from "@/components/sections/dashboard/create-image";
import { EntryListTabs } from "@/components/sections/dashboard/entry-list";
import { FeaturedEntryCard } from "@/components/sections/dashboard/featured-entry-card";
import { UserStats } from "@/components/sections/dashboard/user-stats";
import { PageContentSkeleton } from "@/components/skeletons/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getOrganizationEntries, getUserUploads } from "@/lib/db/queries/entries";
import { getUserGeneratedImagesCount } from "@/lib/db/queries/media";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
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







