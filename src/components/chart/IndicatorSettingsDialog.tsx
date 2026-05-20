"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useChartStore,
  DEFAULT_CONFIG,
  type IndicatorKey,
} from "@/lib/store/chart-store";

const TITLES: Record<IndicatorKey, string> = {
  ema20: "EMA — Slot 1",
  ema50: "EMA — Slot 2",
  ema200: "EMA — Slot 3",
  sma20: "SMA — Slot 1",
  rsi: "RSI",
  macd: "MACD",
  volume: "Volumen",
  atr: "ATR",
  breakout: "Breakout Levels",
  tmTrend: "TM Trend Detection",
  tmBreakout: "TM Breakout Detection",
  tmMomentum: "TM Momentum",
  tmVolatility: "TM Volatility Filter",
  tmStrategy: "TM Strategy Score",
};

export function IndicatorSettingsDialog() {
  const target = useChartStore((s) => s.settingsTarget);
  const setTarget = useChartStore((s) => s.setSettingsTarget);
  const config = useChartStore((s) => s.config);
  const setConfig = useChartStore((s) => s.setConfig);

  const open = target !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTarget(null);
      }}
    >
      <DialogContent className="max-w-sm bg-tv-panel">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {target ? TITLES[target] : ""} — Configuración
          </DialogTitle>
        </DialogHeader>
        {target && (
          <SettingsForm
            target={target}
            config={config}
            onSave={(patch) => {
              setConfig(patch);
              setTarget(null);
            }}
            onReset={() => {
              setConfig(DEFAULT_CONFIG);
              setTarget(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FormProps {
  target: IndicatorKey;
  config: typeof DEFAULT_CONFIG;
  onSave: (patch: Partial<typeof DEFAULT_CONFIG>) => void;
  onReset: () => void;
}

function SettingsForm({ target, config, onSave, onReset }: FormProps) {
  // Local draft state to avoid recalculating chart on every keystroke
  const [draft, setDraft] = useState({
    ema20: config.ema20,
    ema50: config.ema50,
    ema200: config.ema200,
    sma20: config.sma20,
    rsi: config.rsi,
    macdFast: config.macdFast,
    macdSlow: config.macdSlow,
    macdSignal: config.macdSignal,
    atr: config.atr,
    breakout: config.breakout,
    tmSmaPeriod: config.tmSmaPeriod,
    tmRangePeriod: config.tmRangePeriod,
    tmVolumeMult: config.tmVolumeMult,
    tmRsiPeriod: config.tmRsiPeriod,
    tmAtrPeriod: config.tmAtrPeriod,
    tmAtrThreshold: config.tmAtrThreshold,
  });

  useEffect(() => {
    setDraft({
      ema20: config.ema20,
      ema50: config.ema50,
      ema200: config.ema200,
      sma20: config.sma20,
      rsi: config.rsi,
      macdFast: config.macdFast,
      macdSlow: config.macdSlow,
      macdSignal: config.macdSignal,
      atr: config.atr,
      breakout: config.breakout,
      tmSmaPeriod: config.tmSmaPeriod,
      tmRangePeriod: config.tmRangePeriod,
      tmVolumeMult: config.tmVolumeMult,
      tmRsiPeriod: config.tmRsiPeriod,
      tmAtrPeriod: config.tmAtrPeriod,
      tmAtrThreshold: config.tmAtrThreshold,
    });
  }, [config, target]);

  function save() {
    if (target === "ema20") onSave({ ema20: clamp(draft.ema20, 2, 500) });
    else if (target === "ema50") onSave({ ema50: clamp(draft.ema50, 2, 500) });
    else if (target === "ema200") onSave({ ema200: clamp(draft.ema200, 2, 500) });
    else if (target === "sma20") onSave({ sma20: clamp(draft.sma20, 2, 500) });
    else if (target === "rsi") onSave({ rsi: clamp(draft.rsi, 2, 100) });
    else if (target === "macd")
      onSave({
        macdFast: clamp(draft.macdFast, 2, 100),
        macdSlow: clamp(draft.macdSlow, 2, 200),
        macdSignal: clamp(draft.macdSignal, 2, 100),
      });
    else if (target === "atr") onSave({ atr: clamp(draft.atr, 2, 100) });
    else if (target === "breakout") onSave({ breakout: clamp(draft.breakout, 2, 200) });
    else if (target === "volume") onSave({});
    else if (target === "tmTrend")
      onSave({ tmSmaPeriod: clamp(draft.tmSmaPeriod, 2, 500) });
    else if (target === "tmBreakout")
      onSave({
        tmRangePeriod: clamp(draft.tmRangePeriod, 2, 200),
        tmVolumeMult: clampFloat(draft.tmVolumeMult, 0.1, 10),
      });
    else if (target === "tmMomentum")
      onSave({ tmRsiPeriod: clamp(draft.tmRsiPeriod, 2, 100) });
    else if (target === "tmVolatility")
      onSave({
        tmAtrPeriod: clamp(draft.tmAtrPeriod, 2, 100),
        tmAtrThreshold: clampFloat(draft.tmAtrThreshold, 0.01, 10),
      });
    else if (target === "tmStrategy") onSave({});
  }

  return (
    <div className="flex flex-col gap-3">
      {(target === "ema20" || target === "ema50" || target === "ema200") && (
        <Field
          label="Período"
          value={draft[target]}
          onChange={(n) => setDraft((d) => ({ ...d, [target]: n }))}
        />
      )}
  {target === "sma20" && (
    <Field label="Período" value={draft.sma20} onChange={(n) => setDraft((d) => ({ ...d, sma20: n }))} />
  )}
      {target === "rsi" && (
        <Field
          label="Período"
          value={draft.rsi}
          onChange={(n) => setDraft((d) => ({ ...d, rsi: n }))}
        />
      )}
      {target === "macd" && (
        <div className="grid grid-cols-3 gap-2">
          <Field
            label="Rápida"
            value={draft.macdFast}
            onChange={(n) => setDraft((d) => ({ ...d, macdFast: n }))}
          />
          <Field
            label="Lenta"
            value={draft.macdSlow}
            onChange={(n) => setDraft((d) => ({ ...d, macdSlow: n }))}
          />
          <Field
            label="Señal"
            value={draft.macdSignal}
            onChange={(n) => setDraft((d) => ({ ...d, macdSignal: n }))}
          />
        </div>
      )}
      {target === "atr" && (
        <Field
          label="Período"
          value={draft.atr}
          onChange={(n) => setDraft((d) => ({ ...d, atr: n }))}
        />
      )}
      {target === "breakout" && (
        <Field
          label="Lookback (velas)"
          value={draft.breakout}
          onChange={(n) => setDraft((d) => ({ ...d, breakout: n }))}
        />
      )}
      {target === "volume" && (
        <p className="text-xs text-tv-text-muted">
          El indicador de volumen no tiene parámetros configurables en esta
          versión.
        </p>
      )}
      {target === "tmTrend" && (
        <Field
          label="SMA Período"
          value={draft.tmSmaPeriod}
          onChange={(n) => setDraft((d) => ({ ...d, tmSmaPeriod: n }))}
        />
      )}
      {target === "tmBreakout" && (
        <div className="flex flex-col gap-3">
          <Field
            label="Rango Período"
            value={draft.tmRangePeriod}
            onChange={(n) => setDraft((d) => ({ ...d, tmRangePeriod: n }))}
          />
          <Field
            label="Multiplicador Volumen"
            value={draft.tmVolumeMult}
            onChange={(n) => setDraft((d) => ({ ...d, tmVolumeMult: n }))}
            step={0.1}
          />
        </div>
      )}
      {target === "tmMomentum" && (
        <Field
          label="RSI Período"
          value={draft.tmRsiPeriod}
          onChange={(n) => setDraft((d) => ({ ...d, tmRsiPeriod: n }))}
        />
      )}
      {target === "tmVolatility" && (
        <div className="flex flex-col gap-3">
          <Field
            label="ATR Período"
            value={draft.tmAtrPeriod}
            onChange={(n) => setDraft((d) => ({ ...d, tmAtrPeriod: n }))}
          />
          <Field
            label="Umbral ATR"
            value={draft.tmAtrThreshold}
            onChange={(n) => setDraft((d) => ({ ...d, tmAtrThreshold: n }))}
            step={0.01}
          />
        </div>
      )}
      {target === "tmStrategy" && (
        <p className="text-xs text-tv-text-muted">
          TM Strategy Score compone los otros 4 indicadores Turtle_Miura.
          Configure los parámetros en cada indicador individual.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-tv-text-muted hover:text-tv-text"
        >
          Reset defaults
        </Button>
        <Button size="sm" onClick={save} className="bg-tv-blue hover:bg-tv-blue/90">
          Aplicar
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-tv-text-muted">
        {label}
      </span>
      <Input
        type="number"
        min={0}
        max={500}
        step={step}
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onChange(n);
        }}
        className="bg-tv-bg tabular-nums"
      />
    </label>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function clampFloat(n: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, n)) * 100) / 100;
}
