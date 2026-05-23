// src/hooks/useAlertNotifications.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAlertStore, type Alert } from "@/lib/store/alert-store";
import { useChartStore, type IndicatorKey } from "@/lib/store/chart-store";

/** Notification payload shown to the user */
export interface AlertNotification {
  id: string;
  alertId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

/** Check if a numeric condition is met */
function evaluateCondition(
  current: number,
  operator: string,
  threshold: number,
): boolean {
  switch (operator) {
    case ">":
      return current > threshold;
    case "<":
      return current < threshold;
    case ">=":
      return current >= threshold;
    case "<=":
      return current <= threshold;
    default:
      return false;
  }
}

/**
 * Hook that monitors active alerts and triggers notifications
 * when conditions are met. Uses the chart store for indicator values
 * and the alert store for alert definitions.
 */
export function useAlertNotifications(
  /** Current price of the active symbol */
  currentPrice: number | null,
  /** Current indicator values keyed by indicator name */
  indicatorValues: Partial<Record<IndicatorKey, number>>,
) {
  const alerts = useAlertStore((s) => s.alerts);
  const notificationsRef = useRef<AlertNotification[]>([]);
  const triggeredRef = useRef<Set<string>>(new Set());

  /** Get current notifications */
  const getNotifications = useCallback(() => notificationsRef.current, []);

  /** Mark a notification as read */
  const markRead = useCallback((id: string) => {
    const n = notificationsRef.current.find((n) => n.id === id);
    if (n) n.read = true;
  }, []);

  /** Clear all notifications */
  const clearAll = useCallback(() => {
    notificationsRef.current = [];
  }, []);

  useEffect(() => {
    for (const alert of alerts) {
      if (!alert.enabled) continue;

      const { condition, id } = alert;
      let triggered = false;
      let message = "";

      if (condition.type === "price" && currentPrice !== null) {
        triggered = evaluateCondition(
          currentPrice,
          condition.operator,
          condition.value,
        );
        if (triggered) {
          message = `${condition.symbol} price ${condition.operator} ${condition.value} (current: ${currentPrice.toFixed(2)})`;
        }
      } else if (condition.type === "indicator") {
        const val = indicatorValues[condition.indicator];
        if (val !== undefined) {
          triggered = evaluateCondition(val, condition.operator, condition.value);
          if (triggered) {
            message = `${condition.symbol} ${condition.indicator} ${condition.operator} ${condition.value} (current: ${val.toFixed(2)})`;
          }
        }
      }

      if (triggered && !triggeredRef.current.has(id)) {
        triggeredRef.current.add(id);

        const notification: AlertNotification = {
          id: `${id}-${Date.now()}`,
          alertId: id,
          message,
          timestamp: Date.now(),
          read: false,
        };

        notificationsRef.current = [
          notification,
          ...notificationsRef.current,
        ].slice(0, 50); // Keep last 50

        // Try browser notification if permitted
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("Miura Trade Alert", { body: message });
          } catch {
            // Notification API may not be available in all contexts
          }
        }
      } else if (!triggered && triggeredRef.current.has(id)) {
        // Reset trigger when condition is no longer met
        triggeredRef.current.delete(id);
      }
    }
  }, [alerts, currentPrice, indicatorValues]);

  // Request notification permission on mount
  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return { getNotifications, markRead, clearAll };
}
