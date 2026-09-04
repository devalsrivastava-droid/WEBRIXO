# AI Usage Report — WEBRIXO

**Track:** AI SaaS Startup
**Live:** https://webrixo.vercel.app
**Repository:** https://github.com/devalsrivastava-droid/WEBRIXO

---

## Summary

WEBRIXO was built AI-first from an existing rough prototype to a deployed
product. Effectively all of the shipped codebase — the homepage, the design
system, the authentication flow, the payments layer, the account area and the
backend schema — was written by Claude (Opus 4.5) through conversational
direction. The human role was product direction, judgement calls, and the
credential-bound steps AI is not permitted to perform.

**Estimated AI share of execution: ~90%.**
Roughly 6,000 lines of TypeScript, TSX and CSS were AI-written. Human-written
code: none of substance. Human-performed work: account creation, API keys,
deployment approvals, and the design decisions that steered each iteration.

---

## Tools used

| Tool | Used for |
|---|---|
| **Claude (Opus 4.5)** | Primary builder: architecture, all application code, CSS design system, backend schema and functions, copywriting, SEO metadata, documentation |
| **Claude's sandbox** | Ran `npm install`, `tsc`, `vite build`, rendered the site headlessly and screenshotted it to self-review the design between iterations |
| **Convex** | Backend platform (database, auth, server functions) |
| **Vercel** | Hosting and CI |

---

## How AI was actually used

### 1. Reading and diagnosing the existing product

The starting point was a prototype repository. Claude cloned it, read the whole
tree, and identified concrete problems before writing anything: an empty About
section, fabricated scarcity copy ("3 of 5 slots available"), a contact form
that pretended to send but stored nothing, a PWA manifest still carrying a
different company's name, and a stack of competing visual effects — glitch text,
particles, noise overlays, a 3D cube — that fought each other for attention.

### 2. Design, iterated visually

Rather than generating markup blind, Claude built the site, rendered it in a
headless browser, screenshotted it, and looked at the result — then fixed what
it saw. Several defects were caught this way and not by a human:

- Buttons rendering invisible against a light background because a CSS reset
  was overriding component styles
- The horizontal showreel overflowing the pinned viewport
- A sign-in form pushed off-centre by an unconstrained animated column
- Native `<select>` elements ignoring the dark theme on WebKit

### 3. Building the product surface

Written from scratch by AI: a scroll-scrubbed Three.js hero that flies a camera
through the demo sites, a pinned horizontal showreel, a drag-to-compare
before/after slider, a scroll-driven "watch a site build itself" sequence, an
inverting light "paper" band for pricing, plus the header, cursor, preloader and
page transitions. Every animation respects `prefers-reduced-motion`.

### 4. Backend and payments

AI designed the Convex schema (`users`, `inquiries`, `orders`), wrote the
mutations and queries, and implemented a payments layer that routes INR to
Razorpay and all other currencies to Stripe. Webhook handlers verify provider
signatures with constant-time comparison and reject replayed events — an order
is only ever marked paid by a verified webhook, never by the browser returning
to a success URL.

### 5. Location-aware pricing

Prices are quoted in the visitor's currency, inferred from browser timezone and
language. AI proposed this over the Geolocation API and argued the case:
a permission prompt costs conversions before trust exists, and precise
coordinates create a data-protection liability that pricing never needed.
Timezone answers the actual question and identifies nobody.

### 6. Bugs AI found by testing its own work

Two would have reached real users:

- **The six-digit code input dropped digits.** It rebuilt its value from React
  state, which lags a render — so pasted or autofilled codes lost characters.
  Rewritten to read the DOM directly.
- **Currency formatting lost separators** (`₹20000`). The locale was left to the
  browser; some fall back to one without grouping. Now pinned per currency, with
  Indian 2-2-3 grouping as a fallback.

---

## What AI would not do, and why that was right

Claude declined to create accounts or handle live API keys — Stripe, Razorpay
and Convex credentials are bound to a bank account and a legal identity. It
wrote the full integration reading from environment variables, then documented
exactly which keys to set and where, in `PAYMENTS.md`. Those values were entered
by the human, in the providers' own dashboards, and never passed through a chat.

This is the correct division. AI wrote the code that moves money; a human holds
the keys that authorise it.

---

## Representative prompts

The build was conversational, not prompt-engineered. Actual direction given:

1. *"make this website wayyyy better and should look professional with cinematic animations"* — opened the redesign
2. *"it should look like sites like nexstudio.tech or scroll video sites"* — set the motion direction
3. *"cursor a bit delayed, so fix that, and when clicked, it gives ripples"* — a specific interaction fix
4. *"also, it should not be just india... make it according to that and add a paying system too where we get money into our account"* — internationalisation and payments
5. *"can we skip the whole sign in with google thing, and just make a normal sign in"* — simplification, which led to swapping email codes for passwords
6. *"google code and guest mode not working"* — debugging, which surfaced the missing `JWT_PRIVATE_KEY` and produced the preview-mode fallback

Note the shape: short, informal, outcome-focused. The AI was expected to
interpret intent, choose the approach, implement it, verify it, and report
honestly on what it had and had not done.

---

## Honest limitations

- Conversion rates between currencies are hardcoded and will drift. Documented
  as such, with a recommendation to set deliberate per-currency prices instead.
- Project previews are CSS-drawn rather than screenshots of the real demos.
- The homepage is client-rendered; pre-rendering is listed as the next step for
  crawlers that don't execute JavaScript.
- Payments are code-complete but not activated, because provider KYC takes days.
  With no keys set, the buttons degrade to "email us for an invoice" rather than
  erroring.

---

## Verdict

The interesting result is not that AI wrote the code. It is that AI reviewed its
own output visually, found four rendering defects and two logic bugs a human
would likely have shipped, argued a privacy position that improved the product,
and refused the one category of task it should have refused. Direction stayed
human. Execution did not.
