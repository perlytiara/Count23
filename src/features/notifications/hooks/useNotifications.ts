"use client";

import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted" && VAPID_PUBLIC_KEY) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.pushManager) {
          const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key as unknown as BufferSource,
          });
        }
      } catch {
        // Push subscription optional; app works without backend
      }
    }
    return result === "granted";
  }, [supported]);

  const subscribeForPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (permission !== "granted" || !supported || !VAPID_PUBLIC_KEY) return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return null;
      const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key as unknown as BufferSource,
      });
      return sub;
    } catch {
      return null;
    }
  }, [permission, supported]);

  const sendNotification = useCallback(
    async (title: string, body: string) => {
      if (permission !== "granted") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: "/icons/icon-192.svg",
          badge: "/icons/icon-192.svg",
          tag: "count23-notification",
        } as NotificationOptions);
      } catch {
        new Notification(title, { body });
      }
    },
    [permission],
  );

  return { permission, supported, requestPermission, sendNotification, subscribeForPush };
}
