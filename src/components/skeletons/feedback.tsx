import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedbackSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Alert skeleton */}
        <div className="border rounded-lg p-4 flex gap-3">
          <Skeleton className="h-4 w-4 flex-shrink-0" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Feedback sections skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
