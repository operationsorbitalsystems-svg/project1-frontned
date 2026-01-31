"use client";

import { useEffect, useState } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { getSensorState } from "@/lib/api";
import { SensorIdForm } from "@/components/SensorIdForm";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { sensorId, setSensorId, setSensorState, loadFromStorage } =
    useSensorStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount and validate stored sensor
  useEffect(() => {
    async function initFromStorage() {
      const storedId = loadFromStorage();

      if (storedId) {
        // Validate the stored sensor ID
        const result = await getSensorState(storedId);

        if (result.data) {
          setSensorId(storedId);
          setSensorState(result.data);
        }
        // If validation fails, don't set the ID (user will see the form)
      }

      setIsLoading(false);
    }

    initFromStorage();
  }, [loadFromStorage, setSensorId, setSensorState]);

  // Show loading state while checking storage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show form if no sensor is validated, otherwise show dashboard
  return sensorId ? <Dashboard /> : <SensorIdForm />;
}
