"use client";

import { useState } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { setSensorInterval, turnSensorOn, turnSensorOff } from "@/lib/api";

const MIN_INTERVAL = 1;
const MAX_INTERVAL = 1200; // 20 minutes

export function SensorControls() {
  const { sensorId, sensorState, setSensorState } = useSensorStore();

  const [intervalValue, setIntervalValue] = useState(
    sensorState?.sleep_interval_seconds.toString() || "60"
  );
  const [intervalLoading, setIntervalLoading] = useState(false);
  const [powerLoading, setPowerLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleIntervalSubmit = async () => {
    if (!sensorId) return;

    const seconds = parseInt(intervalValue, 10);
    if (isNaN(seconds) || seconds < MIN_INTERVAL || seconds > MAX_INTERVAL) {
      showFeedback("error", `Interval must be ${MIN_INTERVAL}-${MAX_INTERVAL} seconds`);
      return;
    }

    setIntervalLoading(true);
    const result = await setSensorInterval(sensorId, seconds);
    setIntervalLoading(false);

    if (result.error) {
      showFeedback("error", result.error);
    } else {
      showFeedback("success", `Interval set to ${seconds}s`);
      // Update local state
      if (sensorState) {
        setSensorState({ ...sensorState, sleep_interval_seconds: seconds });
      }
    }
  };

  const handlePowerToggle = async (turnOn: boolean) => {
    if (!sensorId) return;

    setPowerLoading(true);
    const result = turnOn
      ? await turnSensorOn(sensorId)
      : await turnSensorOff(sensorId);
    setPowerLoading(false);

    if (result.error) {
      showFeedback("error", result.error);
    } else {
      showFeedback("success", `Sensor turned ${turnOn ? "ON" : "OFF"}`);
      // Update local state
      if (sensorState) {
        setSensorState({ ...sensorState, is_active: turnOn });
      }
    }
  };

  // Format interval display
  const formatInterval = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Sensor Controls</h2>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Interval Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Measurement Interval
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              min={MIN_INTERVAL}
              max={MAX_INTERVAL}
              value={intervalValue}
              onChange={(e) => setIntervalValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={intervalLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {MIN_INTERVAL}s - {MAX_INTERVAL}s ({MAX_INTERVAL / 60} min max)
            </p>
          </div>
          <button
            onClick={handleIntervalSubmit}
            disabled={intervalLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {intervalLoading ? "..." : "Set"}
          </button>
        </div>
        {sensorState && (
          <p className="mt-2 text-sm text-gray-500">
            Current: {formatInterval(sensorState.sleep_interval_seconds)}
          </p>
        )}
      </div>

      {/* Power Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Power State
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handlePowerToggle(true)}
            disabled={powerLoading || sensorState?.is_active === true}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              sensorState?.is_active === true
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-green-100 focus:ring-green-500"
            } disabled:opacity-50`}
          >
            ON
          </button>
          <button
            onClick={() => handlePowerToggle(false)}
            disabled={powerLoading || sensorState?.is_active === false}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              sensorState?.is_active === false
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-red-100 focus:ring-red-500"
            } disabled:opacity-50`}
          >
            OFF
          </button>
        </div>
        {sensorState && (
          <p className="mt-2 text-sm text-gray-500">
            Current: {sensorState.is_active ? "Active" : "Inactive"}
          </p>
        )}
      </div>
    </div>
  );
}
