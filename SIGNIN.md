# Sign-in

Two ways in, both built into the site. No Google, no email provider, no
third-party account.

- **Email and password** — stored and hashed by Convex Auth.
- **Continue as a guest** — one click, no details.

## Preview mode (no setup)

Open `WEBRIXO-website2-preview.html` and both buttons work immediately. It runs
in the browser and forgets everything when the tab closes. Every screen using it
is labelled "Preview mode". It switches itself off as soon as a real deployment
is connected.

## The real thing — three commands

```bash
npm install
npx @convex-dev/auth --skip-git-check   # generates the signing keys, once
npx convex dev                          # leave running
```

Then in a second terminal:

```bash
npm run dev
```

`npx @convex-dev/auth` is the step people miss. Convex Auth signs sessions with
a private key that doesn't exist until you run it, and without it **every**
sign-in fails with `Missing environment variable JWT_PRIVATE_KEY`. It only needs
running once per deployment.

Set `SITE_URL` in the Convex dashboard (Settings → Environment variables) to
wherever the site is actually served — `http://localhost:5173` while developing.
A mismatch here is why a password is accepted but the session never sticks.

## Going live

```bash
npx convex deploy                # creates the production backend
npx @convex-dev/auth --prod      # production needs its own keys
```

Production is a separate deployment with separate environment variables, so set
`SITE_URL` there too, to your real domain.

## What happened to the email codes

They needed a mail provider and a verified sending domain before anyone could
sign in at all. That's a lot of setup standing between a visitor and an account,
and a lot to go wrong on a demo. Passwords need nothing external.

If you want codes back later, `@convex-dev/auth/providers/Email` and the old
`src/convex/auth/emailOtp.ts` still work — add the provider back in
`src/convex/auth.ts` alongside `Password()`.

## Troubleshooting

| What you see | What it means |
|---|---|
| `Missing environment variable JWT_PRIVATE_KEY` | Run `npx @convex-dev/auth --skip-git-check` |
| Orange "Preview mode" notice | No `VITE_CONVEX_URL`, or you're in the preview file |
| "That email and password don't match" | Wrong details, or no account yet — use Create one |
| Password accepted, still signed out | `SITE_URL` doesn't match the address in the browser |
