"use client";

import { useSensorStore } from "@/store/sensorStore";
import { format } from "date-fns";

export function LiveDataCard() {
  const { liveData, wsStatus, sensorState } = useSensorStore();

  const statusColors: Record<string, string> = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500",
    disconnected: "bg-gray-400",
    error: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    connected: "Live",
    connecting: "Connecting...",
    disconnected: "Disconnected",
    error: "Connection Error",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Live Data</h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${statusColors[wsStatus]}`}
          />
          <span className="text-sm text-gray-500">
            {statusLabels[wsStatus]}
          </span>
        </div>
      </div>

      {liveData ? (
        <div className="space-y-4">
          {/* Temperature - Large Display */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Temperature</p>
            <p className="text-5xl font-light text-gray-900">
              {liveData.temperature_c.toFixed(1)}
              <span className="text-2xl text-gray-400">°C</span>
            </p>
          </div>

          {/* Battery (if available) */}
          {liveData.battery_percent !== undefined && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Battery</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      liveData.battery_percent > 20
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${liveData.battery_percent}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12">
                  {liveData.battery_percent}%
                </span>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <p className="text-sm text-gray-700">
              {format(new Date(liveData.timestamp), "MMM d, yyyy HH:mm:ss")}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-400">
            {wsStatus === "connected"
              ? "Waiting for data..."
              : "Connect to see live data"}
          </p>
        </div>
      )}

      {/* Current Interval Info */}
      {sensorState && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Reporting every {sensorState.sleep_interval_seconds}s
          </p>
        </div>
      )}
    </div>
  );
}
