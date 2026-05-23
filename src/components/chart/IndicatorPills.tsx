import React from "react";
import { IndicatorPill } from "./IndicatorPill";
import { INDICATOR_COLORS } from "@/lib/store/chart-store";
import { formatPrice, formatVolume } from "@/lib/format";

export const IndicatorPills = React.memo(function IndicatorPills({
  indicators,
  hidden,
  config,
  lastValues,
  toggleHidden,
  setSettingsTarget,
  removeIndicator,
}: any) {
  return (
    <div className="mt-1 flex flex-col items-start gap-1">
      {indicators.ema20 && (
        <IndicatorPill
          name={`EMA ${config.ema20}`}
          value={lastValues.ema20 !== undefined ? formatPrice(lastValues.ema20) : undefined}
          color={INDICATOR_COLORS.ema20}
          hidden={hidden.ema20}
          onToggleHide={() => toggleHidden("ema20")}
          onSettings={() => setSettingsTarget("ema20")}
          onRemove={() => removeIndicator("ema20")}
        />
      )}
      {indicators.ema50 && (
        <IndicatorPill
          name={`EMA ${config.ema50}`}
          value={lastValues.ema50 !== undefined ? formatPrice(lastValues.ema50) : undefined}
          color={INDICATOR_COLORS.ema50}
          hidden={hidden.ema50}
          onToggleHide={() => toggleHidden("ema50")}
          onSettings={() => setSettingsTarget("ema50")}
          onRemove={() => removeIndicator("ema50")}
        />
      )}
      {indicators.ema200 && (
        <IndicatorPill
          name={`EMA ${config.ema200}`}
          value={lastValues.ema200 !== undefined ? formatPrice(lastValues.ema200) : undefined}
          color={INDICATOR_COLORS.ema200}
          hidden={hidden.ema200}
          onToggleHide={() => toggleHidden("ema200")}
          onSettings={() => setSettingsTarget("ema200")}
          onRemove={() => removeIndicator("ema200")}
        />
      )}
      {indicators.sma20 && (
        <IndicatorPill
          name={`SMA ${config.sma20}`}
          value={lastValues.sma20 !== undefined ? formatPrice(lastValues.sma20) : undefined}
          color={INDICATOR_COLORS.sma20}
          hidden={hidden.sma20}
          onToggleHide={() => toggleHidden("sma20")}
          onSettings={() => setSettingsTarget("sma20")}
          onRemove={() => removeIndicator("sma20")}
        />
      )}
      {indicators.volume && (
        <IndicatorPill
          name="Vol"
          value={lastValues.volume !== undefined ? formatVolume(lastValues.volume) : undefined}
          color={INDICATOR_COLORS.volume}
          hidden={hidden.volume}
          onToggleHide={() => toggleHidden("volume")}
          onSettings={() => setSettingsTarget("volume")}
          onRemove={() => removeIndicator("volume")}
        />
      )}
    </div>
  );
});
