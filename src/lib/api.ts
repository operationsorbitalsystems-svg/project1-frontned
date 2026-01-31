import { config } from "./config";
import type {
  SensorState,
  HistoryPoint,
  ControlResponse,
  BucketSize,
} from "@/types/sensor";

type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

async function apiCall<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        return { error: "Sensor not found" };
      }
      return { error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function getSensorState(
  sensorId: string
): Promise<ApiResult<SensorState>> {
  return apiCall<SensorState>(
    `${config.apiBaseUrl}/sensors/${encodeURIComponent(sensorId)}/state`
  );
}

export async function getSensorHistory(
  sensorId: string,
  from: string,
  to: string,
  bucket: BucketSize = "1m"
): Promise<ApiResult<HistoryPoint[]>> {
  const params = new URLSearchParams({ from, to, bucket });
  return apiCall<HistoryPoint[]>(
    `${config.apiBaseUrl}/sensors/${encodeURIComponent(sensorId)}/history?${params}`
  );
}

export async function setSensorInterval(
  sensorId: string,
  seconds: number
): Promise<ApiResult<ControlResponse>> {
  return apiCall<ControlResponse>(
    `${config.apiBaseUrl}/sensors/${encodeURIComponent(sensorId)}/interval/${seconds}`
  );
}

export async function turnSensorOn(
  sensorId: string
): Promise<ApiResult<ControlResponse>> {
  return apiCall<ControlResponse>(
    `${config.apiBaseUrl}/sensors/${encodeURIComponent(sensorId)}/on`
  );
}

export async function turnSensorOff(
  sensorId: string
): Promise<ApiResult<ControlResponse>> {
  return apiCall<ControlResponse>(
    `${config.apiBaseUrl}/sensors/${encodeURIComponent(sensorId)}/off`
  );
}
