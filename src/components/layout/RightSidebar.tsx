"use client";

import dynamic from "next/dynamic";
import { SidebarSkeleton } from "@/components/ui/skeleton";

const Watchlist = dynamic(
  () => import("@/components/watchlist/Watchlist").then((m) => ({ default: m.Watchlist })),
  { loading: () => <SidebarSkeleton /> },
);

export function RightSidebar() {
  return (
    <aside className="flex w-64 flex-col border-l border-tv-border bg-tv-panel">
      <Watchlist />
    </aside>
  );
}
