"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Payments.
 *
 * Two providers, chosen per request by currency:
 *   - Razorpay for INR (an Indian business can settle rupees directly).
 *   - Stripe for everything else (cards worldwide, ~135 currencies).
 *
 * Both are called over plain HTTPS, so there is no SDK to install and no
 * secret ever reaches the browser. Set these in the Convex dashboard
 * (Settings → Environment variables), never in .env or in this file:
 *
 *   STRIPE_SECRET_KEY        sk_live_… or sk_test_…
 *   STRIPE_WEBHOOK_SECRET    whsec_…   (from the webhook you create)
 *   RAZORPAY_KEY_ID          rzp_live_… or rzp_test_…
 *   RAZORPAY_KEY_SECRET
 *   RAZORPAY_WEBHOOK_SECRET
 *   SITE_URL                 https://webrixo.com
 *
 * Money lands in whichever bank account you connected inside Stripe or
 * Razorpay. Nothing here touches your account details.
 */

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter website",
  studio: "Studio website",
  care: "Care plan, first month",
};

/** A deposit, not the full price: enough to book the work, refundable if we can't help. */
export const createCheckout = action({
  args: {
    plan: v.union(v.literal("starter"), v.literal("studio"), v.literal("care")),
    currency: v.string(),
    /** Amount in the smallest unit: paise for INR, cents for USD. */
    minorAmount: v.number(),
    email: v.string(),
    name: v.optional(v.string()),
    business: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string; provider: string; orderId: string }> => {
    const currency = args.currency.toUpperCase();
    const label = PLAN_LABELS[args.plan] ?? "Website project";
    const site = process.env.SITE_URL ?? "https://webrixo.com";

    if (!Number.isFinite(args.minorAmount) || args.minorAmount < 100) {
      throw new Error("That amount doesn't look right. Please refresh and try again.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
      throw new Error("Please enter a valid email address so we can send the receipt.");
    }

    // Record the intent first, so an abandoned checkout is still a lead.
    const orderId: string = await ctx.runMutation(internal.orders.record, {
      plan: args.plan,
      currency,
      minorAmount: args.minorAmount,
      email: args.email.trim().toLowerCase(),
      name: args.name?.trim(),
      business: args.business?.trim(),
      provider: currency === "INR" ? "razorpay" : "stripe",
    });

    if (currency === "INR") {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) throw new Error("Payments aren't switched on yet. Email hello@webrixo.com and we'll send an invoice.");

      const res = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
        },
        body: JSON.stringify({
          amount: args.minorAmount,
          currency: "INR",
          description: `WEBRIXO — ${label} (deposit)`,
          customer: { email: args.email, name: args.name || undefined },
          notify: { email: true, sms: false },
          reminder_enable: true,
          notes: { orderId, plan: args.plan, business: args.business ?? "" },
          callback_url: `${site}/thank-you?order=${orderId}`,
          callback_method: "get",
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.description || "We couldn't start the payment. Please try again.");
      await ctx.runMutation(internal.orders.attachProvider, { orderId, providerId: body.id });
      return { url: body.short_url as string, provider: "razorpay", orderId };
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Payments aren't switched on yet. Email hello@webrixo.com and we'll send an invoice.");

    // Stripe's API takes form encoding, not JSON.
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("customer_email", args.email);
    form.set("success_url", `${site}/thank-you?order=${orderId}&paid=1`);
    form.set("cancel_url", `${site}/#pricing`);
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", currency.toLowerCase());
    form.set("line_items[0][price_data][unit_amount]", String(args.minorAmount));
    form.set("line_items[0][price_data][product_data][name]", `WEBRIXO — ${label}`);
    form.set("line_items[0][price_data][product_data][description]", "Deposit to book the work. Refundable if we decide we're not the right fit.");
    form.set("metadata[orderId]", orderId);
    form.set("metadata[plan]", args.plan);
    if (args.business) form.set("metadata[business]", args.business);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error?.message || "We couldn't start the payment. Please try again.");
    await ctx.runMutation(internal.orders.attachProvider, { orderId, providerId: body.id });
    return { url: body.url as string, provider: "stripe", orderId };
  },
});

/** Lets the front end hide the pay buttons when no provider is configured yet. */
export const paymentsEnabled = action({
  args: {},
  handler: async (): Promise<{ stripe: boolean; razorpay: boolean }> => ({
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  }),
});
