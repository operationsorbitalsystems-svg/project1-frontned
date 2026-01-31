import { create } from "zustand";
import type {
  SensorState,
  TelemetryReading,
  HistoryPoint,
  TimeRange,
} from "@/types/sensor";

const STORAGE_KEY = "sensor_id";

export type WsStatus = "disconnected" | "connecting" | "connected" | "error";

interface SensorStore {
  // Sensor identity
  sensorId: string | null;
  sensorState: SensorState | null;

  // Live data from WebSocket
  liveData: TelemetryReading | null;
  liveBuffer: TelemetryReading[];
  wsStatus: WsStatus;

  // Historical data
  historyData: HistoryPoint[];
  historyRange: TimeRange;
  customRange: { from: Date; to: Date } | null;
  historyLoading: boolean;

  // Actions
  setSensorId: (id: string) => void;
  setSensorState: (state: SensorState) => void;
  setWsStatus: (status: WsStatus) => void;
  appendLiveData: (data: TelemetryReading) => void;
  setHistoryData: (data: HistoryPoint[]) => void;
  setHistoryRange: (range: TimeRange) => void;
  setCustomRange: (range: { from: Date; to: Date } | null) => void;
  setHistoryLoading: (loading: boolean) => void;
  clearLiveBuffer: () => void;
  reset: () => void;
  loadFromStorage: () => string | null;
}

export const useSensorStore = create<SensorStore>((set, get) => ({
  // Initial state
  sensorId: null,
  sensorState: null,
  liveData: null,
  liveBuffer: [],
  wsStatus: "disconnected",
  historyData: [],
  historyRange: "1h",
  customRange: null,
  historyLoading: false,

  // Actions
  setSensorId: (id) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
    set({ sensorId: id });
  },

  setSensorState: (state) => set({ sensorState: state }),

  setWsStatus: (status) => set({ wsStatus: status }),

  appendLiveData: (data) => {
    const { liveBuffer } = get();
    // Keep only last 100 readings to prevent memory growth
    const newBuffer = [...liveBuffer, data].slice(-100);
    set({ liveData: data, liveBuffer: newBuffer });
  },

  setHistoryData: (data) => set({ historyData: data }),

  setHistoryRange: (range) => set({ historyRange: range }),

  setCustomRange: (range) => set({ customRange: range }),

  setHistoryLoading: (loading) => set({ historyLoading: loading }),

  clearLiveBuffer: () => set({ liveBuffer: [] }),

  reset: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      sensorId: null,
      sensorState: null,
      liveData: null,
      liveBuffer: [],
      wsStatus: "disconnected",
      historyData: [],
      historyRange: "1h",
      customRange: null,
      historyLoading: false,
    });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  },
}));
