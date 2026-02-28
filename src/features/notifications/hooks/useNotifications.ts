"use client";

import { useState, useEffect, useCallback } from "react";

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
    return result === "granted";
  }, [supported]);

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

  return { permission, supported, requestPermission, sendNotification };
}
