# counterapi.dev v2 — Simple Hit Counter Usage

## When to use
Use counterapi.dev when you need to track **simple numeric values** (visits, installs, downloads, clicks) without setting up GA4, PostHog, or Umami. It requires no SDK, no dashboard configuration, and no cookie consent — just HTTP calls with a Bearer token.

## Setup

### Env var
```env
NEXT_PUBLIC_COUNTERAPI_KEY=
```

### Base URL pattern
```
https://api.counterapi.dev/v2/{your-namespace}
```
Pick a namespace (e.g. your GitHub username). Counter names are arbitrary strings you define on first use.

## Core patterns

### Increment a counter (fire-and-forget)
```ts
const BASE = "https://api.counterapi.dev/v2/your-namespace";
const headers: HeadersInit = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_COUNTERAPI_KEY ?? ""}`,
};
const isProd = process.env.NODE_ENV === "production";

export async function trackVisit(): Promise<void> {
  if (!isProd) return; // never increment in dev
  try {
    await fetch(`${BASE}/my-app-visits/up`, { headers });
  } catch {
    // silent fail — never block the user
  }
}
```
- Always gate on `NODE_ENV === "production"` before incrementing.
- Always wrap in `try/catch` and swallow the error.

### Read a counter
`GET /{namespace}/{counter-name}` returns `{ count: number }`.

### Read multiple counters in parallel
```ts
export interface Stats {
  visits: number;
  installs: number;
}

export async function getStats(): Promise<Stats> {
  try {
    const [visitsRes, installsRes] = await Promise.all([
      fetch(`${BASE}/my-app-visits`, { headers }),
      fetch(`${BASE}/my-app-installs`, { headers }),
    ]);
    const [v, i] = await Promise.all([
      visitsRes.json() as Promise<{ count: number }>,
      installsRes.json() as Promise<{ count: number }>,
    ]);
    return { visits: v.count, installs: i.count };
  } catch {
    return { visits: 0, installs: 0 }; // zeroes on any error
  }
}
```

## React display component
```tsx
"use client";
import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/core/pwa";

export function StatsBadge() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then((data) => {
      if (data.visits > 0 || data.installs > 0) setStats(data);
    });
  }, []);

  if (!stats) return null; // render nothing while loading or on zero/error

  return (
    <span>
      {stats.visits.toLocaleString()} visits · {stats.installs.toLocaleString()} installs
    </span>
  );
}
```

## Key rules
- Never throw — all fetches must be wrapped in `try/catch` with silent fallback
- Never increment in development (`NODE_ENV !== "production"`)
- Render nothing (`return null`) while stats are loading or on error
- Use `Promise.all` for parallel reads to avoid waterfall

## Source reference
- `src/core/pwa.ts` — increment + read helpers
- `src/components/InstallBadge.tsx` — React display component
- Project: `phucbm/hieu-chu-han`
