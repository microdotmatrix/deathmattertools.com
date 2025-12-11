import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EntryWithObituaries } from "@/lib/db/queries";
import { UserUpload } from "@/lib/db/schema";
import { format } from "date-fns";

export const UserStats = ({
  entries,
  uploads,
  entriesThisMonth,
}: {
  entries: EntryWithObituaries[];
  uploads: UserUpload[];
  entriesThisMonth: number;
}) => {
  const totalEntries = entries.length;
  const totalUploads = uploads.length;
  const stats = [
    {
      label: "Total Entries",
      value: totalEntries,
      icon: "mdi:account-multiple",
    },
    {
      label: "This Month",
      value: entriesThisMonth,
      icon: "mdi:calendar-month",
    },
    {
      label: "Uploads",
      value: totalUploads,
      icon: "mdi:cloud-upload",
    },
  ];

  const latestEntry = entries[0];
  const latestUpload = uploads[0];
  const helperText = entriesThisMonth
    ? "Great work—keep the momentum going this month."
    : "No entries yet this month. Create one to stay on track.";

  return (
    <Card className="rounded-3xl border bg-card/80 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-background/70 p-4 @container [@container(min-width:16rem)]:grid [@container(min-width:16rem)]:grid-rows-[auto_auto] [@container(min-width:16rem)]:gap-3"
            >
              <div className="flex items-center gap-3 [@container(min-width:16rem)]:grid [@container(min-width:16rem)]:grid-cols-[auto_auto] [@container(min-width:16rem)]:items-start [@container(min-width:16rem)]:gap-6">
                <div className="rounded-full bg-muted/70 p-2 w-fit self-center justify-self-end">
                  <Icon icon={stat.icon} className="size-5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold [@container(min-width:16rem)]:text-3xl [@container(min-width:20rem)]:text-4xl">
                  {stat.value}
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground [@container(min-width:16rem)]:col-span-2 [@container(min-width:16rem)]:text-center [@container(min-width:16rem)]:justify-self-center [@container(min-width:16rem)]:mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Activity Highlights
          </p>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Newest Entry</p>
              <p className="font-medium">{latestEntry?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {latestEntry?.createdAt
                  ? format(new Date(latestEntry.createdAt), "MMM d, yyyy")
                  : "Add an entry to see activity"}
              </p>
            </div>
            
          </div>
          <p className="mt-4 rounded-md bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            {helperText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};