import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntryWithObituaries } from "@/lib/db/queries/entries";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ActionButtons } from "./entry-action-buttons";

export const EntryListTabs = ({
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

export const EntryList = ({
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

export const EntryRow = ({ entry, isOwnEntry }: { entry: EntryWithObituaries; isOwnEntry: boolean }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-border">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
        <div className="flex flex-col gap-2">
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