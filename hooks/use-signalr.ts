"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export interface LocationData {
  userName: string;
  lat: number;
  lon: number;
}

export interface UseSignalRReturn {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  sendLocation: (lat: number, lon: number, userName: string) => Promise<void>;
  receivedLocations: LocationData[];
  connectionError: string | null;
  isConnecting: boolean;
}

export function useSignalR(hubUrl: string): UseSignalRReturn {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receivedLocations, setReceivedLocations] = useState<LocationData[]>(
    []
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const createConnection = useCallback(() => {
    console.log("SignalR: Creating new HubConnection instance.");
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 4) {
            return Math.random() * 10000 + 2000; // 2-12 seconds
          } else {
            return null; // Stop retrying
          }
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return newConnection;
  }, [hubUrl]);

  const startConnection = useCallback(async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      console.log(
        "SignalR: Already connected. Skipping new connection attempt."
      );
      return;
    }

    setIsConnecting(true);
    console.log("SignalR: Attempting to connect to Hub...");
    setConnectionError(null);

    try {
      const newConnection = createConnection();

      // Set up event handlers
      newConnection.on("ReceiveLatLon", (data: LocationData) => {
        console.log("SignalR: Received location:", data);
        setReceivedLocations((prev) => {
          const updated = [data, ...prev].slice(0, 50);
          return updated;
        });
      });

      newConnection.onclose((error) => {
        console.log("SignalR: Connection closed. Error:", error);
        setIsConnected(false);
        if (error) {
          setConnectionError(`Connection closed: ${error.message || error}`);
        } else {
          setConnectionError("Connection closed unexpectedly.");
        }
      });

      newConnection.onreconnecting((error) => {
        console.log("SignalR: Reconnecting. Error:", error);
        setIsConnected(false);
        setConnectionError("Reconnecting...");
      });

      newConnection.onreconnected((connectionId) => {
        console.log(
          "SignalR: Reconnected successfully. Connection ID:",
          connectionId
        );
        setIsConnected(true);
        setConnectionError(null);
      });

      console.log("SignalR: Calling newConnection.start()...");
      await newConnection.start();
      console.log(
        "SignalR: Connected successfully. Connection state:",
        newConnection.state
      );

      setConnection(newConnection);
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      console.error("SignalR: Connection failed in catch block:", error);
      setConnectionError(
        error instanceof Error ? error.message : String(error)
      );
      console.log("SignalR: Retrying connection in 5 seconds...");

      reconnectTimeoutRef.current = setTimeout(() => {
        startConnection();
      }, 5000);
    } finally {
      setIsConnecting(false);
      console.log(
        "SignalR: Connection attempt finished. isConnecting set to false."
      );
    }
  }, [connection, createConnection]);

  const sendLocation = useCallback(
    async (lat: number, lon: number, userName: string) => {
      if (
        !connection ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        console.warn(
          "SignalR: Attempted to send location but connection is not established."
        );
        throw new Error("SignalR connection not established");
      }

      try {
        await connection.invoke("SendLatLon", lat, lon, userName);
        console.log("SignalR: Location sent successfully:", {
          lat,
          lon,
          userName,
        });
      } catch (error) {
        console.error("SignalR: Failed to send location:", error);
        throw error;
      }
    },
    [connection]
  );

  useEffect(() => {
    console.log(
      "SignalR: useSignalR useEffect - Initializing connection on mount."
    );
    startConnection();

    return () => {
      console.log(
        "SignalR: useSignalR useEffect cleanup - Stopping connection."
      );
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connection) {
        connection.stop();
      }
    };
  }, [startConnection]);

  console.log(
    "SignalR: Current hook state: isConnected =",
    isConnected,
    ", isConnecting =",
    isConnecting,
    ", connectionError =",
    connectionError
  );
  return {
    connection,
    isConnected,
    sendLocation,
    receivedLocations,
    connectionError,
    isConnecting,
  };
}
