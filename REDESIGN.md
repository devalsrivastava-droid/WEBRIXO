# WEBRIXO — Website 2

Website 1 is preserved separately (`WEBRIXO-website1.zip`). Nothing here overwrites it.

## Structure of the homepage

1. **Hero** — pinned scroll scene. A Three.js corridor of the four demo sites that the camera flies down as you scroll, with three statements crossfading. Textures are drawn on canvas at runtime, so there are no image assets to load. Falls back to a static gradient without WebGL or with reduced motion.
2. **Marquee** — sectors we build for; speed and skew follow scroll direction.
3. **Work** — pinned horizontal showreel with parallax inside each browser frame.
4. **Stats** — four numbers that count up on entry.
5. **Services** — five pinned cards, each with its own animated shape (bars, grid, wave, ring, split).
6. **Build with AI** — scroll-scrubbed sequence where a site assembles itself, step by step.
7. **Two ways** — AI (blue) versus human (copper), with facts side by side.
8. **Process** — four steps with a rail that draws as you scroll.
9. **Before / after** — drag to compare a dated clinic site with a WEBRIXO build.
10. **Client quotes** — pinned, one quote at a time, swapped by scroll position.
11. **Pricing + checklist** — an inverted "paper" band with torn edges. Real starting prices.
12. **About** — pinned manifesto whose words light up.
13. **Team**, **FAQ**, **interstitial**, **contact**, **footer** with a giant wordmark reveal.

## Interaction details

- **Cursor** — a dot with no smoothing at all (CSS `translate`, so it never lags the pointer) plus a ring that trails 0.18s behind. Ripples spawn on click; both parts compress on press. The ring grows on links, becomes a copper "View" badge over work and a "Drag" badge over the comparison slider.
- **Chrome on light** — the fixed header, chapter rail, progress bar and cursor flip to dark automatically while the paper band passes under them (`useChromeOnLight`).
- **Smooth scroll** — Lenis, wired into GSAP's ticker so pinning stays in sync.
- **Page wipe** — internal links play a curtain before the route changes.
- Everything above respects `prefers-reduced-motion`: pins release, scrubs become static, cursor and grain switch off.

## Files

- `src/pages/Home.tsx` — composes the page.
- `src/components/home/` — `Chrome` (preloader, header, menu), `Hero` + `HeroScene`, `Showreel`, `ProjectFrame`, `Extras` (marquee, services, before/after, checklist, chapters), `Proof` (stats, pricing, quotes, team), `AiBuild`, `Sections`, `Closing`, `motion` (smooth scroll, reveals, magnetic buttons, cursor), `data.ts`.
- `src/pages/Auth.tsx` — sign-in rebuilt to match: six-box code entry, guest option, drifting demo frames.
- `src/styles/home.css` — tokens, type scale, layout, motion, and the `.wx-invert` paper band.
- `src/convex/inquiries.ts` + the `inquiries` table — the contact form stores real leads, with a mailto fallback.

## SEO

`index.html` carries Organization, WebSite, ProfessionalService (with real priced Offers) and FAQPage structured data, full Open Graph and Twitter tags, a 1200×630 PNG social image, PNG icons, favicon and maskable icon, a fixed manifest, a sitemap with `lastmod`, and a `robots.txt` that keeps auth pages out of the index. Headings run in order with a single H1.

No trace of the old starter template remains: the `@vly-ai` package, its toolbar, `integrations.md` and every config reference are gone, and the lockfiles were regenerated.

## Location-aware pricing and payments

Prices are quoted in the visitor's own currency, guessed from their browser
timezone and language (no permission prompt, nobody identified), with a manual
switcher that always wins. Deposits are taken through Razorpay for INR and
Stripe for every other currency; signed webhooks are the only thing that marks
an order paid. See `PAYMENTS.md` for the account setup — that part needs your
own credentials, which never touch this repo.

## Accounts and onboarding

`src/components/Onboarding.tsx` runs after a first sign-in: four short steps
collecting name, business, country, city, sector and the one thing the site has
to fix. Country, timezone and currency arrive pre-filled from the browser's own
signals and are shown plainly ("We guessed India, from your timezone
Asia/Kolkata") so the person corrects a guess instead of filling a form.

`src/pages/Account.tsx` shows what we hold and what they've sent: projects
booked, requests sent, paid to date per currency, last activity, the full
profile (with an inline editor), payment history with receipt status, and past
requests. Everything is derived from that person's own rows via
`users.accountSummary` — no cross-user aggregates — and a "clear my location
details" button wipes the region fields without touching the account.

## Running it

```bash
bun install            # or npm install
npx convex dev         # regenerates src/convex/_generated and pushes the inquiries table
bun run dev
bun run build:single   # optional: one self-contained HTML file in dist-single/
```

## Worth doing next

- Swap the CSS-drawn project previews for real screenshots of the demos.
- Pre-render the homepage so crawlers get full HTML without running JS.
- Restyle `/privacy`, `/terms`, `/account` and the 404 page to match (they still use the older white theme).
- Add an admin view for `inquiries.listOpen`.
