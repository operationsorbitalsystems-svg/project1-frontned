"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useSensorStore } from "@/store/sensorStore";
import type { TimeRange } from "@/types/sensor";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "custom", label: "Custom" },
];

function formatXAxis(range: TimeRange) {
  return (timestamp: string) => {
    const date = new Date(timestamp);
    switch (range) {
      case "1h":
        return format(date, "HH:mm");
      case "1d":
        return format(date, "HH:mm");
      case "1w":
        return format(date, "MMM d");
      default:
        return format(date, "MMM d HH:mm");
    }
  };
}

export function HistoryChart() {
  const {
    historyData,
    liveBuffer,
    historyRange,
    historyLoading,
    setHistoryRange,
    setCustomRange,
  } = useSensorStore();

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Merge historical data with live buffer for real-time updates
  const chartData = useMemo(() => {
    // Convert history data to chart format
    const historyPoints = historyData.map((point) => ({
      time: point.time,
      temperature: point.avg_temp,
    }));

    // Convert live buffer to chart format
    const livePoints = liveBuffer.map((reading) => ({
      time: reading.timestamp,
      temperature: reading.temperature_c,
    }));

    // Merge and sort by time
    const merged = [...historyPoints, ...livePoints].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Remove duplicates (same timestamp)
    const unique = merged.filter(
      (point, index, self) =>
        index === self.findIndex((p) => p.time === point.time)
    );

    return unique;
  }, [historyData, liveBuffer]);

  const handleRangeChange = (range: TimeRange) => {
    if (range === "custom") {
      setHistoryRange(range);
    } else {
      setCustomRange(null);
      setHistoryRange(range);
    }
  };

  const handleCustomSubmit = () => {
    if (customFrom && customTo) {
      setCustomRange({
        from: new Date(customFrom),
        to: new Date(customTo),
      });
      setHistoryRange("custom");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Temperature History</h2>

        {/* Time Range Selector */}
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                historyRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Picker */}
      {historyRange === "custom" && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <input
            type="datetime-local"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="datetime-local"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customFrom || !customTo}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No data available for this range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis(historyRange)}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) =>
                  format(new Date(label), "MMM d, yyyy HH:mm:ss")
                }
                formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temp"]}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data points indicator */}
      {chartData.length > 0 && (
        <p className="mt-2 text-xs text-gray-400 text-right">
          {chartData.length} data points
          {liveBuffer.length > 0 && ` (+${liveBuffer.length} live)`}
        </p>
      )}
    </div>
  );
}
