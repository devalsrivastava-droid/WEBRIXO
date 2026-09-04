# Taking payments

The code is finished. What's left is creating the accounts and pasting six values
into the Convex dashboard — that part only you can do, because they're your
business credentials and your bank account.

**I never see, store or enter these keys.** They live in Convex's environment
variables, are read only by server-side code, and never reach the browser bundle.

## How money reaches you

A visitor picks a plan → a deposit checkout opens on Stripe's or Razorpay's own
page → they pay there → the provider deposits into whichever bank account you
connected inside that provider → a signed webhook tells your site the payment
cleared, and the order is marked paid.

Card numbers never touch your site, so you have far less compliance to worry
about.

## Which provider runs when

| Visitor's currency | Provider | Why |
|---|---|---|
| INR | Razorpay | An Indian business can settle rupees directly, and Indian customers get UPI, netbanking and cards. |
| Everything else | Stripe | Cards worldwide in ~135 currencies. |

The switch is automatic, in `src/convex/payments.ts`. If you only want one
provider, set only that one's keys — the other simply never runs.

## Setup

### 1. Razorpay (for rupee payments)

1. Sign up at razorpay.com and finish KYC. You'll need PAN, business proof and
   your bank account details.
2. Settings → API Keys → generate live keys.
3. Settings → Webhooks → add
   `https://<your-deployment>.convex.site/webhooks/razorpay`
   with events `payment_link.paid` and `payment.failed`. Set a secret you choose.

### 2. Stripe (for everyone else)

1. Sign up at stripe.com and complete the account activation.
2. Developers → API keys → copy the secret key.
3. Developers → Webhooks → add
   `https://<your-deployment>.convex.site/webhooks/stripe`
   with event `checkout.session.completed`. Copy the signing secret it shows.

Note: a Stripe account registered in India can't freely charge international
cards without export documentation. If that applies, use Razorpay's
international payments instead, or register Stripe in a country where you have
a legal entity. Worth a quick word with your accountant before you switch it on.

### 3. Paste the values into Convex

Convex dashboard → your deployment → Settings → Environment variables:

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SITE_URL                 https://webrixo.com
```

Do not put these in `.env`, in the repo, or anywhere the front end can read.
Until they're set, the pay buttons return a friendly "email us for an invoice"
message rather than failing.

### 4. Test before going live

Use test keys first. Stripe's test card is `4242 4242 4242 4242` with any future
expiry. Razorpay has test cards in their docs. Pay once, then check the `orders`
table in the Convex dashboard shows `status: "paid"` — that confirms the webhook
signature check is working end to end.

## Prices

Set in `src/components/home/Proof.tsx` (`PLANS`) as rupee base prices plus the
deposit taken up front. Currently:

| Plan | Price | Deposit |
|---|---|---|
| Starter | ₹25,000 | ₹7,500 |
| Studio | ₹75,000 | ₹20,000 |
| Care | ₹4,000/month | ₹4,000 |

Other currencies are converted from these using the rates in
`src/lib/region.ts` and rounded to a sane step, so nobody sees "$1,087".
**Those rates are hardcoded and will drift.** Either review them every few
months, or set deliberate per-currency prices (often better anyway — $1,100 reads
as a considered price, a converted one doesn't).

## Where the location handling lives

`src/lib/region.ts`. It reads the browser's timezone and language — both sent by
every visitor automatically, needing no permission prompt and identifying nobody
— and maps them to a currency. A manual switcher always overrides the guess and
is remembered.

This deliberately avoids the Geolocation API: it would throw a permission popup
before you've earned any trust, hurt conversion, and hand you street-level
coordinates you'd then be responsible for storing. Timezone answers the only
question pricing actually asks.
