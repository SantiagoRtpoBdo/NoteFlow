import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-[280px] flex-col border-r p-3 gap-3">
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="space-y-1 mt-4">
          <Skeleton className="h-3 w-16 mb-3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <Skeleton className="h-10 w-2/3" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
