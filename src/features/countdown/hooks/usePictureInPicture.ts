"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatRemaining } from "../utils/time";

const PIP_WIDTH = 320;
const PIP_HEIGHT = 180;

function drawCountdown(ctx: CanvasRenderingContext2D, remainingMs: number): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = "#0a0f1e";
  ctx.fillRect(0, 0, w, h);

  const text = formatRemaining(remainingMs);
  const title = "Count23";

  ctx.font = "14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
  ctx.textAlign = "center";
  ctx.fillText(title, w / 2, h / 2 - 36);

  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.fillStyle = remainingMs <= 60_000 ? "#ef4444" : "#3b82f6";
  ctx.fillText(text, w / 2, h / 2 + 8);

  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
  ctx.fillText("Tap to expand", w / 2, h - 16);
}

export function usePictureInPicture(targetTime: Date | null) {
  const targetTimeRef = useRef(targetTime);
  const [isActive, setIsActive] = useState(false);

  targetTimeRef.current = targetTime;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isSupported =
    typeof document !== "undefined" &&
    "pictureInPictureEnabled" in document &&
    document.pictureInPictureEnabled &&
    "requestPictureInPicture" in HTMLVideoElement.prototype;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    if (containerRef.current && containerRef.current.parentNode) {
      containerRef.current.parentNode.removeChild(containerRef.current);
    }
    canvasRef.current = null;
    videoRef.current = null;
    containerRef.current = null;
    setIsActive(false);
  }, []);

  const enterPiP = useCallback(() => {
    if (!targetTimeRef.current || !isSupported) return;

    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;";

    const canvas = document.createElement("canvas");
    canvas.width = PIP_WIDTH;
    canvas.height = PIP_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    container.appendChild(canvas);
    container.appendChild(video);
    document.body.appendChild(container);

    canvasRef.current = canvas;
    videoRef.current = video;
    containerRef.current = container;

    const tick = () => {
      const target = targetTimeRef.current;
      if (!target) return;
      const remaining = target.getTime() - Date.now();
      if (remaining <= 0) {
        cleanup();
        return;
      }
      drawCountdown(ctx, remaining);
    };

    tick();
    streamRef.current = canvas.captureStream(30);
    video.srcObject = streamRef.current;

    const onLeave = () => {
      video.removeEventListener("leavepictureinpicture", onLeave);
      cleanup();
    };
    video.addEventListener("leavepictureinpicture", onLeave);

    video
      .play()
      .then(() => video.requestPictureInPicture())
      .then(() => {
        setIsActive(true);
        intervalRef.current = setInterval(tick, 1000);
      })
      .catch(() => cleanup());
  }, [isSupported, cleanup]);

  const exitPiP = useCallback(() => {
    if (document.pictureInPictureElement && videoRef.current) {
      document.exitPictureInPicture().catch(() => {});
    }
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { enterPiP, exitPiP, isSupported, isActive };
}
