// Sensor state from GET /sensors/{id}/state
export interface SensorState {
  sensor_id: string;
  name: string;
  created_at: string;
  last_seen: string;
  sleep_interval_seconds: number;
  is_active: boolean;
}

// Live telemetry from WebSocket
export interface TelemetryReading {
  sensor_id: string;
  timestamp: string;
  temperature_c: number;
  battery_percent?: number;
}

// Historical data point from GET /sensors/{id}/history
export interface HistoryPoint {
  time: string;
  avg_temp: number;
  avg_battery?: number;
}

// WebSocket subscription response
export interface WsSubscriptionResponse {
  status: "subscribed";
  sensor_id: string;
}

// WebSocket error response
export interface WsErrorResponse {
  error: string;
}

// WebSocket acknowledgment event
export interface WsAckEvent {
  sensor_id: string;
  event: "ack";
  type: "INTERVAL" | "POWER";
  status: string;
}

// Union type for all WebSocket messages
export type WsMessage =
  | WsSubscriptionResponse
  | WsErrorResponse
  | TelemetryReading
  | WsAckEvent;

// API response types
export interface ControlResponse {
  status: "sent";
  sensor_id: string;
  interval?: number;
  power?: "ON" | "OFF";
}

// Time range options for history
export type TimeRange = "1h" | "1d" | "1w" | "custom";

// Bucket options for history aggregation
export type BucketSize = "1m" | "5m" | "1h" | "1d";
