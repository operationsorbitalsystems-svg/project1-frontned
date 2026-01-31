"use client";

import { useEffect, useRef } from "react";
import { config } from "@/lib/config";
import { useSensorStore } from "@/store/sensorStore";
import type { TelemetryReading, WsMessage } from "@/types/sensor";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket(sensorId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const shouldReconnectRef = useRef(true);

  const { setWsStatus, appendLiveData } = useSensorStore();

  // Store callbacks in refs to avoid stale closures
  const setWsStatusRef = useRef(setWsStatus);
  const appendLiveDataRef = useRef(appendLiveData);

  useEffect(() => {
    setWsStatusRef.current = setWsStatus;
    appendLiveDataRef.current = appendLiveData;
  }, [setWsStatus, appendLiveData]);

  useEffect(() => {
    if (!sensorId) return;

    shouldReconnectRef.current = true;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

    function connect() {
      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      setWsStatusRef.current("connecting");

      const wsUrl = `${config.wsBaseUrl}/ws/dashboard`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send subscription message
        ws.send(JSON.stringify({ sensor_id: sensorId }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);

          // Check for subscription confirmation
          if ("status" in message && message.status === "subscribed") {
            setWsStatusRef.current("connected");
            // Reset reconnect delay on successful connection
            reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
            return;
          }

          // Check for error
          if ("error" in message) {
            console.error("WebSocket error:", message.error);
            setWsStatusRef.current("error");
            return;
          }

          // Check for telemetry data (has temperature_c)
          if ("temperature_c" in message) {
            appendLiveDataRef.current(message as TelemetryReading);
            return;
          }

          // Handle ack events (optional logging)
          if ("event" in message && message.event === "ack") {
            console.log("Command acknowledged:", message.type, message.status);
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onerror = () => {
        setWsStatusRef.current("error");
      };

      ws.onclose = () => {
        wsRef.current = null;

        // Only reconnect if we should
        if (shouldReconnectRef.current) {
          setWsStatusRef.current("disconnected");

          // Schedule reconnect with exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 2,
              MAX_RECONNECT_DELAY
            );
            if (shouldReconnectRef.current) {
              connect();
            }
          }, reconnectDelayRef.current);
        }
      };
    }

    connect();

    // Cleanup
    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setWsStatusRef.current("disconnected");
    };
  }, [sensorId]);

  const disconnect = () => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus("disconnected");
  };

  return { disconnect };
}
