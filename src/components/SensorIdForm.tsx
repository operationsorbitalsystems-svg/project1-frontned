"use client";

import { useState } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { getSensorState } from "@/lib/api";

export function SensorIdForm() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setSensorId, setSensorState } = useSensorStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedId = inputValue.trim();
    if (!trimmedId) {
      setError("Please enter a sensor ID");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getSensorState(trimmedId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Success - update store
    setSensorId(trimmedId);
    setSensorState(result.data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Sensor Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Enter your sensor ID to view live data and controls.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="sensorId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sensor ID
            </label>
            <input
              id="sensorId"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., esp32_abc123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Examples: esp32_abc123, ESP32-983DAEAB81AC
        </p>
      </div>
    </div>
  );
}
