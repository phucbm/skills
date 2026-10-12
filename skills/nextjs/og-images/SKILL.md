---
name: og-images
description: Use when adding Open Graph / share images (OG cards, Twitter cards, social preview images) to a Next.js App Router site, generating them with next/og (ImageResponse, Satori), or when a card breaks on Cloudflare Workers / OpenNext (fs errors, missing fonts, WOFF2 or WebP errors, og:image redirects, og:type lost on pages).
when_to_use: User mentions og:image, opengraph-image.tsx, twitter-image, ImageResponse, next/og, @vercel/og, Satori, share cards, social previews, or asks for "one image per page" on a Next.js site, especially one deployed through @opennextjs/cloudflare.
allowed-tools: Bash, Read, Edit, Write
---

# Dynamic OG images in Next.js (App Router, works on Cloudflare Workers)

One 1200×630 PNG per page, drawn from the page's own data with `next/og`. Built for a Worker, which has no filesystem: nothing is read from disk at request time.

Seen in: perxel.com (drawn at build, served from OpenNext's cache, assets as base64), OpenRace (drawn on request with each page's `revalidate`, fallback card on fetch failure) and phucbm.com (one catch-all route, cards copied into static assets).

---

## 1. Decide when cards are drawn

- **Content in the repo** (MDX, TS data): draw at build. `export const dynamic = "force-static"`, plus `generateStaticParams` on dynamic segments.
- **Card shows data that goes stale** (counts, dates, new items): use the page's own `revalidate`, and return a fallback card when the fetch fails. A card route must always return an image.

**Even a `force-static` route must not read from disk.** OpenNext can run a "static" route module again on a cache miss, so a `readFile` that works in `next build` throws in production. Embed fonts and images as base64 in `.ts` files. The one exception: the Worker never serves the cards (see "Serve as static assets" below).

## 2. Layout

```txt
lib/
  og.tsx               OG_SIZE, createOgImage(), one helper per kind of page
  og-assets/
    fonts.ts           export const inter400 = "<base64>"
    logos.ts           export const siteLogo = "data:image/svg+xml;base64,..."
app/
  about/opengraph-image.tsx                          static page
  blog/opengraph-image.tsx                           listing
  blog/category/[category]/opengraph-image.tsx       dynamic segment
  blog/[slug]/og/route.tsx                           detail page (plain route, see 5)
```

Each route file is ~10 lines: get the data, call a helper. All design lives in `lib/og.tsx`.

## 3. The card module

```tsx
import { ImageResponse } from "next/og"
import { inter400, inter500 } from "@/lib/og-assets/fonts"
import { siteLogo } from "@/lib/og-assets/logos"

export const OG_SIZE = { width: 1200, height: 630 }

// base64 → ArrayBuffer, the format fonts[].data takes
const b64 = (data: string) => Uint8Array.from(Buffer.from(data, "base64")).buffer

interface OgImageOptions { title: string; excerpt?: string; categories?: string[]; secondaryLine?: string }

export function createOgImage({ title, excerpt, categories = [], secondaryLine }: OgImageOptions) {
  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "64px", background: "#fff", fontFamily: "Inter" }}>
        <img src={siteLogo} width={130} height={27} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px" }}>
          <div style={{ fontSize: title.length > 48 ? "60px" : "72px", fontWeight: 500, lineHeight: 1.15 }}>{title}</div>
          {excerpt && <div style={{ fontSize: "26px", lineHeight: 1.5, color: "#555" }}>{excerpt}</div>}
        </div>
        {categories.length || secondaryLine ? (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {categories.map((c) => <span key={c} style={{ display: "flex", padding: "8px 18px", borderRadius: "9999px", background: "#f2f2f2", fontSize: "20px" }}>{c}</span>)}
            {secondaryLine && <span style={{ fontSize: "20px", color: "#777" }}>{secondaryLine}</span>}
          </div>
        ) : <div /> /* keeps space-between from pulling the title down */}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: b64(inter400), weight: 400, style: "normal" },
        { name: "Inter", data: b64(inter500), weight: 500, style: "normal" },
      ],
    },
  )
}

export const createPageOgImage = (page: { title: string; description: string }) =>
  createOgImage({ title: page.title, excerpt: page.description })

// The route must return an image even when the slug doesn't resolve
export function createDetailOgImage(
  item: { title: string; excerpt?: string; categories: string[] } | undefined,
  fallback: { title: string; description: string },
) {
  if (!item) return createPageOgImage(fallback)
  return createOgImage({ title: item.title, excerpt: item.excerpt, categories: item.categories.slice(0, 1) })
}
```

- **Copy the site's look, not its CSS.** Satori runs outside the page: no Tailwind classes, no CSS variables. Use the site's real fonts and hex values inline. Keep shared colours in one TS module that both the CSS and the card import.
- The card module holds no copy. In a multi-language site, every string comes in as an argument.

## 4. Fonts

Satori reads **TTF, OTF and WOFF**. Not WOFF2, not variable fonts. One static file per weight, subset to the characters you draw. Use the site's own typeface. Embed only the weights the card uses: every one ships in the Worker bundle (three faces ≈ 78 KB of `.ts`).

**From Google Fonts** (`text=` subsets; an old Safari user agent makes Google send `.woff`). Writes `fonts.ts` in one go; tested with Geist at four weights, ~17.5 KB each, Vietnamese included:

```js
// node og-fonts.mjs "Geist" 300,400,500,600 > lib/og-assets/fonts.ts
const [family = "Geist", weights = "400"] = process.argv.slice(2)

const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("")
const vi =
  "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ" +
  "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ"
const punct = "–—‘’“”…•·×→←©®™€₫°"
const text = encodeURIComponent([...new Set(ascii + vi + punct)].join(""))

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2"
const css = await (await fetch(
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights.replace(/,/g, ";")}&text=${text}`,
  { headers: { "User-Agent": UA } },
)).text()

const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
  weight: body.match(/font-weight:\s*(\d+)/)[1],
  url: body.match(/url\(([^)]+)\)/)[1],
}))
if (!faces.length) throw new Error(`no @font-face in:\n${css}`)

const id = family.replace(/\W/g, "").replace(/^./, (c) => c.toLowerCase())
for (const { weight, url } of faces) {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  if (buf.subarray(0, 4).toString("latin1") === "wOF2") throw new Error(`${url} is woff2`)
  console.log(`export const ${id}${weight} = "${buf.toString("base64")}"`)
}
```

**From the site's own variable WOFF2** (fonttools): cut a static instance, then drop the WOFF2 wrapping.

```sh
fonttools varLib.instancer site-serif.woff2 wght=500 -o serif-500.ttf
python -c "from fontTools.ttLib import TTFont; f=TTFont('serif-500.ttf'); f.flavor=None; f.save('serif-500.ttf')"
```

- A character outside the subset is not drawn at all. Add every symbol titles use.
- `fonts[].name` must match `fontFamily` in the JSX exactly.

## 5. Images

- **SVG**: `data:image/svg+xml;base64,...`, drawn as is.
- **PNG / JPEG**: base64 data URI, resized first (icons ≤ 128 px).
- **WebP crashes Satori** (hard error, not a missing image). Keep separate PNG copies for cards.
- Every `<img>` needs `width` and `height`.

## 6. Route files

**Static page**, file convention:

```tsx
// app/about/opengraph-image.tsx
import { createPageOgImage, OG_SIZE } from "@/lib/og"
import { aboutPage } from "@/data/pages"

export const dynamic = "force-static"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return createPageOgImage(aboutPage)
}
```

Dynamic segments add `generateStaticParams` from the same list as their page.

**Detail page that may need a hand-made image: a plain route.** A file-based `opengraph-image` overrides whatever `generateMetadata` returns for `openGraph.images`, so an entry could never have its own image. Use `[slug]/og/route.tsx` and let the page choose:

```tsx
// app/blog/[slug]/og/route.tsx
export const dynamic = "force-static"
export const dynamicParams = false
export const generateStaticParams = () => postsAll.map((p) => ({ slug: p.slug }))

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return createDetailOgImage(postsAll.find((p) => p.slug === slug), blogPage)
}
```

```ts
// generateMetadata: the entry's own image wins, else the card
const url = post.ogImage ?? `/blog/${post.slug}/og`
const image = { url: new URL(url, SITE_URL).href, width: 1200, height: 630 }
// openGraph: { ...ogBase, images: [image] }, twitter: { images: [image.url] }
```

If no entry will ever need its own image, `opengraph-image.tsx` everywhere is simpler.

### Serve as static assets (Cloudflare, all content in the repo)

One plain route for every card, `app/og/[...path]/route.tsx`, with `force-static`, `dynamicParams = false`, and `generateStaticParams` listing every page as a path ending in `.png` (a plain route because the build writes `opengraph-image` outputs without an extension). After `opennextjs-cloudflare build`, a script copies every route output (`.next/server/app/**/*.body`) into `.open-next/assets/` without the `.body` suffix. Cloudflare then serves the cards as files and the Worker never runs for one, so this route alone may read fonts with `fs` at build.

## 7. Metadata

- `metadataBase` in the root layout. With several root layouts (one per language) and no top-level one, set it per page and write card URLs absolute.
- `twitter.card: "summary_large_image"` once. A sibling `opengraph-image.tsx` fills both `og:image` and `twitter:image`; a plain route fills neither, so the page sets both.
- **A page's `openGraph` replaces the layout's whole object**, not field by field. Spread a shared base (`{ type: "website", siteName }`) into every page, or pages lose `og:type` and `og:site_name`.
- No default `openGraph.images` on a page that has its own card: leave `images` out so the card fills it.
- A page can opt out with a hand-made image and no card route (often the home page).

## 8. Satori layout rules

- Every element with more than one child needs `display: "flex"`. No grid.
- Inline `style` only, no `className`.
- Cap the title width (920–1000 px) and step its size down for long titles. Two-line clamp: `lineClamp: 2` with `display: "block"`.
- Pill next to a long line: `flexShrink: 0`, `whiteSpace: "nowrap"`.
- No emoji.

## 9. Before shipping

1. Build, open the PNGs and look at them. Try the longest title and diacritics (Đ, ạ, ổ).
2. **Every `og:image` URL must answer 200 by itself, not redirect** (some crawlers don't follow). Locale prefixes and renamed routes cause this. `curl -sI` the exact URL from the HTML.
3. On the Worker (`wrangler dev`, then production), every card answers `image/png`.
4. Check in opengraph.xyz, Facebook Sharing Debugger or LinkedIn Post Inspector (they cache; re-scrape after changes).
5. Watch Worker size: everything in `og-assets` ships with it, and `next/og` itself adds ~3.6 MB (`resvg.wasm`). See the `/cloudflare-pages` skill for limits.

## Checklist

- [ ] Build time or per request, chosen by the data; each card's caching matches its page.
- [ ] `lib/og.tsx`: `OG_SIZE`, `createOgImage()`, one helper per kind of page, fallback for a missing entry.
- [ ] `fonts.ts`: the site's own font, only the weights used, subset with every script the titles use.
- [ ] `logos.ts`: SVG or resized PNG, never WebP.
- [ ] Colours from one shared TS palette.
- [ ] A card for every page, including dynamic segments and every language.
- [ ] Detail pages that may need their own image: plain `[slug]/og/route.tsx`.
- [ ] `metadataBase`, `summary_large_image`, shared `openGraph` base on every page.
- [ ] A line in the project's docs: every new page gets a card.
- [ ] Looked at the images; every `og:image` answers 200.
