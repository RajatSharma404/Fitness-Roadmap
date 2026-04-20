export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] ${className}`}
      {...props}
    />
  );
}

export function ExerciseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)]">
      <div className="h-24 bg-gradient-to-br from-cyan-400/20 to-slate-400/5 p-4">
        <Skeleton className="mb-2 h-4 w-20" />
        <Skeleton className="h-18 w-32 rounded-md" />
      </div>
      <div className="space-y-2 bg-bg-surface p-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LibraryGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailPanelSkeleton() {
  return (
    <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[rgba(255,255,255,0.06)] bg-bg-elevated p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="mt-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
