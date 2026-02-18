import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-16 lg:px-24">
          <Skeleton className="h-16 w-16 rounded-xl mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
