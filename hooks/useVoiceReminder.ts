"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

export type MicPermissionState = "prompt" | "granted" | "denied";
export type CallMode = "sdk" | "iframe" | "idle";

export function useVoiceReminder() {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micPermission, setMicPermission] = useState<MicPermissionState>("prompt");
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>("idle");

  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = new RetellWebClient();
      retellClientRef.current = client;

      client.on("call_started", () => {
        console.log("[CarePulse] Retell call started");
        setIsConnecting(false);
        setIsActive(true);
        setCallStatus("active");
      });

      client.on("call_ended", () => {
        console.log("[CarePulse] Retell call ended");
        setIsActive(false);
        setIsConnecting(false);
        setCallStatus("idle");
        setIsAgentSpeaking(false);
        setCallMode("idle");
      });

      client.on("agent_start_talking", () => {
        setIsAgentSpeaking(true);
      });

      client.on("agent_stop_talking", () => {
        setIsAgentSpeaking(false);
      });

      client.on("error", (err: any) => {
        console.error("[CarePulse] Retell error:", err);
        setError("Voice call encountered an error. Please try again.");
        setIsActive(false);
        setIsConnecting(false);
        setCallStatus("error");
        setIsAgentSpeaking(false);
      });
    }

    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, []);

  const startCall = useCallback(async () => {
    // If call is already active, just maximize
    if (isActive) {
      setIsMinimized(false);
      return;
    }

    setIsConnecting(true);
    setCallStatus("connecting");
    setError(null);

    try {
      // Step 1: Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");

      // Step 2: Call our backend to get a Retell access token
      const response = await fetch("/api/ai/retell-call", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        // If backend fails (no API key), fall back to iframe mode
        console.warn("[CarePulse] Backend failed, falling back to iframe:", data.error);
        setCallMode("iframe");
        setIsActive(true);
        setIsConnecting(false);
        setCallStatus("active");
        return;
      }

      // Step 3: Start the call using the real access token
      if (retellClientRef.current && data.accessToken) {
        setCallMode("sdk");
        await retellClientRef.current.startCall({
          accessToken: data.accessToken,
        });
      } else {
        throw new Error("Failed to initialize voice client.");
      }
    } catch (err: any) {
      console.error("[CarePulse] Error starting call:", err);

      // If it's specifically a mic error
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
        setError(
          "Microphone access is required for voice reminders. Please allow microphone access in your browser settings and try again."
        );
        setIsActive(true); // Show the widget with error
      } else {
        // For any other error, fall back to iframe
        console.warn("[CarePulse] Falling back to iframe mode");
        setCallMode("iframe");
        setIsActive(true);
        setCallStatus("active");
      }
      setIsConnecting(false);
    }
  }, [isActive]);

  const endCall = useCallback(() => {
    if (retellClientRef.current && callMode === "sdk") {
      retellClientRef.current.stopCall();
    }
    setIsActive(false);
    setIsMinimized(false);
    setIsConnecting(false);
    setCallStatus("idle");
    setError(null);
    setIsAgentSpeaking(false);
    setCallMode("idle");
  }, [callMode]);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  return {
    isActive,
    isMinimized,
    isConnecting,
    micPermission,
    error,
    callStatus,
    isAgentSpeaking,
    callMode,
    startCall,
    endCall,
    minimize,
    maximize,
  };
}
