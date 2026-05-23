// src/lib/store/alert-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IndicatorKey } from "@/lib/store/chart-store";

/** Comparison operator for alert conditions */
export type AlertOperator = ">" | "<" | ">=" | "<=";

/**
 * Types of alert conditions.
 * - "price": simple price threshold for a symbol.
 * - "indicator": threshold based on a chart indicator (e.g., EMA, RSI).
 */
export type AlertCondition =
  | {
      type: "price";
      symbol: string;
      operator: AlertOperator;
      value: number;
    }
  | {
      type: "indicator";
      symbol: string;
      indicator: IndicatorKey;
      operator: AlertOperator;
      value: number;
    };

/**
 * Representation of a user alert.
 */
export interface Alert {
  id: string;
  condition: AlertCondition;
  enabled: boolean;
  createdAt: number;
}

/** Zustand store interface for alerts */
export interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

/** Generate a simple UUID v4 fallback */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alert: Alert) => {
        const newAlert: Alert = {
          ...alert,
          id: alert.id || generateId(),
          enabled: alert.enabled ?? true,
          createdAt: alert.createdAt || Date.now(),
        };
        set({ alerts: [...get().alerts, newAlert] });
      },

      removeAlert: (id: string) => {
        set({ alerts: get().alerts.filter((a) => a.id !== id) });
      },

      toggleAlert: (id: string) => {
        set({
          alerts: get().alerts.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a,
          ),
        });
      },
    }),
    {
      name: "miura-alert-state",
      version: 1,
    },
  ),
);
