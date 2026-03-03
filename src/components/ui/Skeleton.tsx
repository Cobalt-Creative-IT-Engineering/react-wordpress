export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%] rounded-lg ${className}`}
      style={{ animation: "shimmer 1.6s infinite linear" }}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="aspect-video" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
