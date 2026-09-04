import { v } from "convex/values";
import { internalMutation, query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Written before the visitor reaches the payment page, so abandoned checkouts are still leads. */
export const record = internalMutation({
  args: {
    plan: v.string(),
    currency: v.string(),
    minorAmount: v.number(),
    email: v.string(),
    name: v.optional(v.string()),
    business: v.optional(v.string()),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("orders", {
      ...args,
      status: "started",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const attachProvider = internalMutation({
  args: { orderId: v.string(), providerId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("orders", args.orderId);
    if (!id) return;
    await ctx.db.patch(id, { providerId: args.providerId });
  },
});

/** Called by the webhook once the provider confirms the money moved. */
export const markPaid = internalMutation({
  args: { providerId: v.string(), paidMinorAmount: v.optional(v.number()), receiptUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_provider_id", q => q.eq("providerId", args.providerId))
      .unique()
      .catch(() => null);
    if (!row) return;
    await ctx.db.patch(row._id, {
      status: "paid",
      paidAt: Date.now(),
      paidMinorAmount: args.paidMinorAmount ?? row.minorAmount,
      receiptUrl: args.receiptUrl,
    });
  },
});

export const markFailed = internalMutation({
  args: { providerId: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("orders")
      .withIndex("by_provider_id", q => q.eq("providerId", args.providerId))
      .unique()
      .catch(() => null);
    if (!row) return;
    await ctx.db.patch(row._id, { status: "failed", failureReason: args.reason });
  },
});

/** What the thank-you page shows after returning from checkout. */
export const publicStatus = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("orders", args.orderId);
    if (!id) return null;
    const row = await ctx.db.get(id);
    if (!row) return null;
    // Deliberately narrow: no email, no provider ids.
    return { plan: row.plan, currency: row.currency, minorAmount: row.minorAmount, status: row.status };
  },
});

/** Admin-only list for the account area. */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const me = await ctx.db.get(userId);
    if (!me || me.role !== "admin") return [];
    return await ctx.db.query("orders").order("desc").take(100);
  },
});

/** Attaches a signed-in user to an order they just paid for. */
export const claim = mutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const id = ctx.db.normalizeId("orders", args.orderId);
    if (!userId || !id) return;
    const row = await ctx.db.get(id);
    if (!row || row.userId) return;
    await ctx.db.patch(id, { userId });
  },
});
