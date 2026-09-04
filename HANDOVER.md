# Running WEBRIXO day to day

## What you need to do once

1. **Make the studio Gmail.** Any address you'll actually check.
2. **Sign up at resend.com** (free, no card) → API Keys → create one.
3. **Convex dashboard → Production → Settings → Environment Variables**, add:
   ```
   RESEND_API_KEY = re_...
   ```
   Nothing else needs it. Until this exists, messages still arrive — they just
   sit in your account instead of emailing you.
4. **Create your admin account** on the live site at `/auth` with a password
   only you ever type. Then Convex → Data → `users` → find your row → set
   `role` to `admin`. That unlocks Messages on your account page.

Never put a password in a file, a chat, or the repo. The only place your admin
password should exist is in your head or a password manager.

## The flow, end to end

1. Someone sends a brief from the site. They pick how they want to be reached —
   email, phone or WhatsApp — and can name their own price.
2. It lands in **Messages** on your account page, under **Needs a reply**.
3. You open it and read what they wrote, what they offered, and how to reach them.
4. You type **the price you're agreeing to** and, optionally, a line for them.
5. **Approve at this price.** The project moves to **Queue**, and they can see
   the agreed price and pay from their own account.
6. They pay → the payment webhook marks it paid → you mark it **queued** and
   start work.

Nothing on the site ever sets or accepts a price. Every number a customer sees
is one you typed.

## Sorting, not filtering

Messages you don't want are moved to **Probably not**, never deleted. That tab
stays readable and anything can be moved back with one click. This matters: a
real enquiry written casually ("saw your insta, do you do salons?") should never
be silently binned by a rule.

## Handover to a client

Set the accounts up in **their** name on the first call, not yours:

- They create a free Vercel account and a registrar account while you watch.
- They add you as a collaborator on the project.
- You build, deploy and launch inside their account.
- At launch you remove your access. Done — nothing to transfer, nothing to
  argue about later.

If a site is already in your account, transfer takes longer: both parties must
accept on Vercel, and a domain can't move registrars within 60 days of
registration. Plan for it rather than promising a same-day handover.

Give them a zip of the source as a backup, with a short README. The zip is not
the website — the deployment and the domain are, and those live in accounts.

## Still to do

- Wire Resend so messages email you, with the sender in reply-to.
- Optional: an automatic acknowledgement to them asking for business name,
  rough page count and any deadline, so your real reply can be useful.
