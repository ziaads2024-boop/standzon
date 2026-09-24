'use client';

import { useEffect } from 'react';

// The old service worker cached stale chunks/pages; it is no longer used.
// Unregister it (and drop its caches) for returning visitors, then do nothing.
export default function DeferredMonitoring() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
  }, []);
  return null;
}
