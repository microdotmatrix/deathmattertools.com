import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";

export const EntryEditContentSkeleton = () => {
  return (
    <div className="space-y-8 loading-fade">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        {/* Main Edit Form - Takes up 2/3 */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obituary Details Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Entry Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Photos & Images Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="mdi:image-multiple" className="w-5 h-5" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="aspect-square w-full rounded-lg"
                      />
                    ))}
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Content Sections - Takes up 1/3 */}
        <div className="space-y-6">
          {/* Saved Quotes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:format-quote-close" className="w-5 h-5" />
                <Skeleton className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-8 w-28 mx-auto rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entry Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5" />
                <Skeleton className="h-5 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};