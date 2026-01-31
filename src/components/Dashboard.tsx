"use client";

import { useSensorStore } from "@/store/sensorStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { LiveDataCard } from "./LiveDataCard";
import { HistoryChart } from "./HistoryChart";
import { SensorControls } from "./SensorControls";

export function Dashboard() {
  const { sensorId, sensorState, reset } = useSensorStore();

  // Initialize WebSocket connection
  useWebSocket(sensorId);

  // Initialize history fetching
  useSensorHistory(sensorId);

  const handleSwitchSensor = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {sensorState?.name || "Sensor Dashboard"}
            </h1>
            <p className="text-sm text-gray-500">{sensorId}</p>
          </div>
          <button
            onClick={handleSwitchSensor}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Switch Sensor
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Data & Controls */}
          <div className="space-y-6">
            <LiveDataCard />
            <SensorControls />
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <HistoryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
