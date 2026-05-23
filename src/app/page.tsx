"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { BottomPanel } from "@/components/layout/BottomPanel";
import { ChartSkeleton, SidebarSkeleton } from "@/components/ui/skeleton";
import { useChartStore } from "@/lib/store/chart-store";

const PriceChart = dynamic(
  () => import("@/components/chart/PriceChart").then((m) => ({ default: m.PriceChart })),
  { loading: () => <ChartSkeleton />, ssr: false },
);

const IndicatorSettingsDialog = dynamic(
  () => import("@/components/chart/IndicatorSettingsDialog").then((m) => ({ default: m.IndicatorSettingsDialog })),
  { ssr: false },
);

const RightSidebar = dynamic(
  () => import("@/components/layout/RightSidebar").then((m) => ({ default: m.RightSidebar })),
  { loading: () => <SidebarSkeleton /> },
);

export default function HomePage() {
  const symbol = useChartStore((s) => s.symbol);
  const timeframe = useChartStore((s) => s.timeframe);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-tv-bg">
      <Header />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <main className="relative flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <PriceChart symbol={symbol} timeframe={timeframe} />
          </div>
        </main>
        <RightSidebar />
      </div>
      <BottomPanel />
      <IndicatorSettingsDialog />
    </div>
  );
}
