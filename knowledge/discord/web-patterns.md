# Discord as Web Backend — Patterns

Two proven patterns for using Discord as zero-infra backend from a Next.js app.

---

## Pattern 1 — Forum Channel as Database

**Use case:** bookmarks, link store, content collection — each Discord Forum thread = one record.

**How it works:**
- Create a Forum channel in your Discord server
- Add a Bot to the server, give it Read Messages/View Channels permission
- Each thread = one record; thread name = title; applied_tags = categories; first message = body/content

**Env vars:**
```env
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=   # Forum channel ID
```

**Fetch flow (Discord REST API v10):**
1. `GET /channels/{channel_id}` — fetch channel metadata + `available_tags` (tag ID → name map)
2. `GET /channels/{channel_id}/threads/archived/public?limit=100` — archived threads
3. `GET /guilds/{guild_id}/threads/active` — active threads (filter by `parent_id === channel_id`)
4. For each thread: `GET /channels/{thread_id}/messages?limit=1` — first message = record content

**Next.js lib pattern** (used in phucbm-web bookmarks):
```ts
export async function getDiscordBookmarks(): Promise<Bookmark[]> {
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
    if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) return [];

    const headers = { Authorization: `Bot ${DISCORD_BOT_TOKEN}` };
    const cache = { next: { revalidate: 3600 } };

    // 1. Channel metadata + tag map
    const channelData = await fetch(
        `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}`,
        { headers, ...cache }
    ).then(r => r.json());

    const tagMap = new Map<string, string>();
    channelData.available_tags?.forEach((t: any) => tagMap.set(t.id, t.name));

    // 2. Archived + active threads
    const [archivedData, guildData] = await Promise.all([
        fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/threads/archived/public?limit=100`, { headers, ...cache }).then(r => r.json()),
        fetch(`https://discord.com/api/v10/guilds/${channelData.guild_id}/threads/active`, { headers, ...cache }).then(r => r.json()),
    ]);

    const threads = [
        ...(archivedData.threads ?? []),
        ...(guildData.threads ?? []).filter((t: any) => t.parent_id === DISCORD_CHANNEL_ID),
    ];

    // 3. First message per thread = record
    const records = await Promise.all(
        threads.map(async (thread: any) => {
            const msgs = await fetch(
                `https://discord.com/api/v10/channels/${thread.id}/messages?limit=1`,
                { headers, ...cache }
            ).then(r => r.json());
            const msg = msgs[0];
            if (!msg) return null;
            return {
                id: thread.id,
                threadName: thread.name,
                content: msg.content,
                tags: (thread.applied_tags ?? []).map((id: string) => tagMap.get(id)).filter(Boolean),
                timestamp: new Date(msg.timestamp),
                author: msg.author.username,
                url: msg.content.match(/(https?:\/\/[^\s]+)/)?.[0] ?? null,
                thumbnail: msg.embeds?.[0]?.thumbnail?.url ?? msg.attachments?.[0]?.url ?? null,
            };
        })
    );

    return records.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
}
```

**Caching:** use `next: { revalidate: 3600 }` (ISR) — avoid fetching per-request, Discord rate-limits at 50 req/s.

**Limitations:**
- 100 archived threads per fetch (no cursor pagination in this pattern — use multiple pages if needed)
- Read-only from the web side; writes go through the Discord client manually
- Not suitable for high-write or relational data

---

## Pattern 2 — Webhook as Form Submission Inbox

**Use case:** contact forms, bug reports, feedback — submissions land in a Discord channel as messages.

**How it works:**
- Create a Webhook in any Discord channel (Channel Settings → Integrations → Webhooks)
- Copy the webhook URL — store it as an env var
- POST `{ content: "..." }` to the webhook URL — no bot, no auth header needed

**Env vars:**
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy
```

**Next.js API route** (`app/api/report/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";

export async function POST(req: NextRequest) {
    if (!WEBHOOK_URL) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { content } = await req.json();
    if (!content || typeof content !== "string")
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });

    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    return NextResponse.json({ ok: true });
}
```

**Client-side call** (used in hieu-chu-han ReportIssueDialog):
```ts
const footer = [url ? `<${url}>` : null, `\`v${version}\``].filter(Boolean).join("  ");
await fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `${message}\n\n${footer}` }),
});
```

**Discord message formatting tips:**
- Wrap URLs in `<url>` to suppress embeds: `<https://example.com>`
- Use \`backticks\` for inline code, triple backtick blocks for structured data
- `**bold**`, `> blockquote` for emphasis

**Limitations:**
- No rate limiting built in — add one if exposed publicly
- No auth on the API route — acceptable for internal/low-traffic tools; add a shared secret header for public apps
- Webhook URL is a secret — never expose it client-side; always proxy through your own API route

---

## Choosing between the two

| | Forum as DB | Webhook Inbox |
|---|---|---|
| Auth needed | Bot token | None (webhook URL) |
| Direction | Read (from Discord) | Write (to Discord) |
| Setup effort | Moderate (bot, permissions) | Minimal (one webhook URL) |
| Best for | Bookmarks, curated content | Forms, reports, notifications |
