"use client";

import { useEffect, useCallback } from "react";
import { subHours, subDays, subWeeks } from "date-fns";
import { useSensorStore } from "@/store/sensorStore";
import { getSensorHistory } from "@/lib/api";
import type { BucketSize, TimeRange } from "@/types/sensor";

function getBucketForRange(range: TimeRange): BucketSize {
  switch (range) {
    case "1h":
      return "1m";
    case "1d":
      return "5m";
    case "1w":
      return "1h";
    case "custom":
      return "5m"; // Default for custom
    default:
      return "1m";
  }
}

function getTimeRangeParams(
  range: TimeRange,
  customRange: { from: Date; to: Date } | null
): { from: string; to: string } {
  const now = new Date();

  if (range === "custom" && customRange) {
    return {
      from: customRange.from.toISOString(),
      to: customRange.to.toISOString(),
    };
  }

  let from: Date;
  switch (range) {
    case "1h":
      from = subHours(now, 1);
      break;
    case "1d":
      from = subDays(now, 1);
      break;
    case "1w":
      from = subWeeks(now, 1);
      break;
    default:
      from = subHours(now, 1);
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}

export function useSensorHistory(sensorId: string | null) {
  const {
    historyRange,
    customRange,
    setHistoryData,
    setHistoryLoading,
    clearLiveBuffer,
  } = useSensorStore();

  const fetchHistory = useCallback(async () => {
    if (!sensorId) return;

    setHistoryLoading(true);
    clearLiveBuffer();

    const { from, to } = getTimeRangeParams(historyRange, customRange);
    const bucket = getBucketForRange(historyRange);

    const result = await getSensorHistory(sensorId, from, to, bucket);

    if (result.data) {
      setHistoryData(result.data);
    } else {
      console.error("Failed to fetch history:", result.error);
      setHistoryData([]);
    }

    setHistoryLoading(false);
  }, [
    sensorId,
    historyRange,
    customRange,
    setHistoryData,
    setHistoryLoading,
    clearLiveBuffer,
  ]);

  // Fetch when sensorId or range changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { refetch: fetchHistory };
}
