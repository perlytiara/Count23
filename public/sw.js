const CACHE_NAME = "count23-v2";
const STATIC_ASSETS = ["/", "/icons/icon-192.png", "/icons/icon-512.png"];
const LIVE_TAG = "count23-live";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("message", (event) => {
  const d = event.data;

  if (d?.type === "COUNTDOWN_LIVE") {
    const body = d.body != null ? d.body : "0s";
    const title = d.title != null ? d.title : "Count23";
    self.registration.getNotifications().then((notifications) => {
      const existing = notifications.find((n) => n.tag === LIVE_TAG);
      const options = {
        body: body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: LIVE_TAG,
        renotify: false,
        requireInteraction: true,
        silent: true,
      };
      if (existing) {
        existing.close();
      }
      return self.registration.showNotification(title, options);
    });
  }

  if (d?.type === "COUNTDOWN_CANCEL") {
    self.registration.getNotifications().then((notifications) => {
      notifications.filter((n) => n.tag === LIVE_TAG).forEach((n) => n.close());
    });
  }

  if (d?.type === "COUNTDOWN_COMPLETE") {
    self.registration.getNotifications().then((notifications) => {
      notifications.filter((n) => n.tag === LIVE_TAG).forEach((n) => n.close());
    });
    self.registration.showNotification(d?.title || "Count23", {
      body: d?.body || "Your countdown has finished!",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "count23-complete",
      renotify: true,
    });
  }

  if (d?.type === "COUNTDOWN_MILESTONE") {
    self.registration.showNotification("Count23", {
      body: d.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [100, 50, 100],
      tag: "count23-milestone",
      renotify: true,
    });
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "Count23", body: "Countdown update" };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (_) {
      payload.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "Count23", {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "count23-push",
      renotify: true,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
