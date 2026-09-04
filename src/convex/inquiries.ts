import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Store a project request from the homepage contact form. */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    business: v.optional(v.string()),
    message: v.string(),
    mode: v.union(v.literal("ai"), v.literal("human")),
    page: v.optional(v.string()),
    phone: v.optional(v.string()),
    contactVia: v.optional(v.union(v.literal("email"), v.literal("phone"), v.literal("whatsapp"))),
    offeredMinor: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    if (name.length < 2) throw new Error("Please tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email address doesn't look right.");
    if (message.length < 10) throw new Error("Tell us a little more about the project.");
    if (message.length > 5000) throw new Error("That message is a bit long. Keep it under 5,000 characters.");

    const userId = (await getAuthUserId(ctx)) ?? undefined;
    return await ctx.db.insert("inquiries", {
      name,
      email,
      business: args.business?.trim() || undefined,
      message,
      mode: args.mode,
      page: args.page,
      phone: args.phone?.trim() || undefined,
      contactVia: args.contactVia ?? "email",
      offeredMinor: args.offeredMinor,
      currency: args.currency?.toUpperCase(),
      userId,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

/** Admin-only: list open requests, newest first. */
export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const me = await ctx.db.get(userId);
    if (!me || me.role !== "admin") return [];
    return await ctx.db.query("inquiries").withIndex("by_status", q => q.eq("status", "new")).order("desc").take(100);
  },
});

/* ── Owner's inbox ─────────────────────────────────────────────────────────
   Nothing is ever deleted or hidden by a filter. Messages are only ever
   sorted, and the owner can move anything back. */

async function requireAdmin(ctx: { db: any; auth: any }) {
  const userId = await getAuthUserId(ctx as never);
  if (!userId) return null;
  const me = await ctx.db.get(userId);
  return me && me.role === "admin" ? me : null;
}

/** Everything that has come in, newest first. */
export const inbox = query({
  args: {},
  handler: async (ctx) => {
    const me = await requireAdmin(ctx as never);
    if (!me) return null;
    const rows = await ctx.db.query("inquiries").order("desc").take(200);
    return rows.map(r => ({
      id: r._id,
      name: r.name,
      email: r.email,
      phone: r.phone ?? null,
      contactVia: r.contactVia ?? "email",
      business: r.business ?? null,
      message: r.message,
      mode: r.mode,
      status: r.status,
      relevant: r.relevant ?? null,
      offeredMinor: r.offeredMinor ?? null,
      agreedMinor: r.agreedMinor ?? null,
      currency: r.currency ?? "INR",
      ownerNote: r.ownerNote ?? null,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt ?? null,
    }));
  },
});

/** Owner sets or accepts the price, which moves it to approved. */
export const approve = mutation({
  args: {
    id: v.id("inquiries"),
    agreedMinor: v.number(),
    currency: v.string(),
    ownerNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await requireAdmin(ctx as never);
    if (!me) throw new Error("Not allowed.");
    if (!Number.isFinite(args.agreedMinor) || args.agreedMinor < 100) {
      throw new Error("That price doesn't look right.");
    }
    await ctx.db.patch(args.id, {
      agreedMinor: args.agreedMinor,
      currency: args.currency.toUpperCase(),
      ownerNote: args.ownerNote?.trim() || undefined,
      status: "approved",
      approvedAt: Date.now(),
      relevant: true,
    });
    // Once email is configured this is where the customer is notified.
  },
});

/** Move between the two tabs, or close a thread. Never deletes. */
export const setStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.optional(v.union(
      v.literal("new"), v.literal("replied"), v.literal("approved"),
      v.literal("queued"), v.literal("closed"),
    )),
    relevant: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const me = await requireAdmin(ctx as never);
    if (!me) throw new Error("Not allowed.");
    await ctx.db.patch(args.id, {
      ...(args.status ? { status: args.status } : {}),
      ...(args.relevant !== undefined ? { relevant: args.relevant } : {}),
    });
  },
});

/** What the customer sees after the owner has replied with a price. */
export const myThreads = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) return [];
    const rows = await ctx.db.query("inquiries").withIndex("by_email", q => q.eq("email", email)).collect();
    return rows
      .filter(r => r.status === "approved" || r.status === "queued")
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(r => ({
        id: r._id,
        business: r.business ?? null,
        agreedMinor: r.agreedMinor ?? null,
        currency: r.currency ?? "INR",
        ownerNote: r.ownerNote ?? null,
        status: r.status,
        approvedAt: r.approvedAt ?? null,
      }));
  },
});
