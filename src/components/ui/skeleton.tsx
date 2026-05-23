"use client";

export function ChartSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-tv-bg">
      <div className="flex w-full flex-col items-center gap-3 px-4">
        <div className="h-6 w-48 animate-pulse rounded bg-tv-panel" />
        <div className="h-[400px] w-full animate-pulse rounded bg-tv-panel" />
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-tv-panel" />
          <div className="h-4 w-16 animate-pulse rounded bg-tv-panel" />
          <div className="h-4 w-16 animate-pulse rounded bg-tv-panel" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 animate-pulse bg-tv-panel p-3">
      <div className="h-6 w-32 rounded bg-tv-border" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-tv-border" />
        ))}
      </div>
    </div>
  );
}

export function DialogSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="h-64 w-80 animate-pulse rounded-lg bg-tv-panel" />
    </div>
  );
}
