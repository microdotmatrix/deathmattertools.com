import type { NextWebVitalsMetric } from "next/app";

const endpoint =
  process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT || "/api/web-vitals";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = JSON.stringify(metric);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(endpoint, body);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Swallow errors to avoid impacting UX
  });
}
