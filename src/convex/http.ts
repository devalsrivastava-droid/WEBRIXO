import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Payment webhooks.
 *
 * The browser returning to /thank-you is not proof of payment — anyone can
 * open that URL. These endpoints are the only place an order becomes "paid",
 * and each verifies the provider's signature before touching the database.
 *
 * Point your dashboards at:
 *   Stripe    https://<your-deployment>.convex.site/webhooks/stripe
 *             event: checkout.session.completed
 *   Razorpay  https://<your-deployment>.convex.site/webhooks/razorpay
 *             events: payment_link.paid, payment.failed
 */

/** Constant-time compare, so a wrong signature can't be guessed by timing. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const header = request.headers.get("stripe-signature") ?? "";
    const raw = await request.text();
    if (!secret) return new Response("not configured", { status: 503 });

    // Stripe sends: t=<timestamp>,v1=<hex hmac of "timestamp.body">
    const parts = Object.fromEntries(header.split(",").map(p => p.split("=") as [string, string]));
    const timestamp = parts["t"];
    const signature = parts["v1"];
    if (!timestamp || !signature) return new Response("bad signature", { status: 400 });
    // Reject replays of old events.
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return new Response("stale", { status: 400 });
    const expected = await hmacHex(secret, `${timestamp}.${raw}`);
    if (!safeEqual(expected, signature)) return new Response("bad signature", { status: 400 });

    const event = JSON.parse(raw);
    const session = event?.data?.object;
    if (event?.type === "checkout.session.completed" && session?.id) {
      await ctx.runMutation(internal.orders.markPaid, {
        providerId: session.id,
        paidMinorAmount: session.amount_total ?? undefined,
        receiptUrl: session.receipt_url ?? undefined,
      });
    } else if (event?.type === "checkout.session.async_payment_failed" && session?.id) {
      await ctx.runMutation(internal.orders.markFailed, { providerId: session.id, reason: "async payment failed" });
    }
    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/webhooks/razorpay",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const raw = await request.text();
    if (!secret) return new Response("not configured", { status: 503 });
    const expected = await hmacHex(secret, raw);
    if (!safeEqual(expected, signature)) return new Response("bad signature", { status: 400 });

    const event = JSON.parse(raw);
    const link = event?.payload?.payment_link?.entity;
    const payment = event?.payload?.payment?.entity;
    if (event?.event === "payment_link.paid" && link?.id) {
      await ctx.runMutation(internal.orders.markPaid, {
        providerId: link.id,
        paidMinorAmount: link.amount_paid ?? undefined,
      });
    } else if (event?.event === "payment.failed" && payment?.description) {
      // Razorpay reports failures against the payment, not the link.
      await ctx.runMutation(internal.orders.markFailed, { providerId: link?.id ?? "", reason: payment.error_description ?? "payment failed" });
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
