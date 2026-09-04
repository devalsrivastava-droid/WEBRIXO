import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    country: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;
    if (args.country !== undefined) updates.country = args.country;
    if (args.company !== undefined) updates.company = args.company;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.bio !== undefined) updates.bio = args.bio;
    await ctx.db.patch(userId, updates);
  },
});

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getActivities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getSupportTickets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const toggleNotification = mutation({
  args: { channel: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("channel"), args.channel))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { enabled: args.enabled });
    } else {
      await ctx.db.insert("notifications", { userId, channel: args.channel, enabled: args.enabled });
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    country: v.string(),
    countryCode: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    currency: v.optional(v.string()),
    company: v.optional(v.string()),
    sector: v.optional(v.string()),
    goal: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(userId);
    await ctx.db.patch(userId, {
      name: args.name.trim(),
      country: args.country,
      countryCode: args.countryCode,
      city: args.city?.trim() || undefined,
      timezone: args.timezone,
      locale: args.locale,
      currency: args.currency,
      company: args.company?.trim() || undefined,
      sector: args.sector,
      goal: args.goal,
      phone: args.phone?.trim() || undefined,
      onboarded: true,
      signedUpAt: existing?.signedUpAt ?? Date.now(),
    });
  },
});

/**
 * Everything the account page shows, in one round trip: the profile, plus
 * counts and totals derived from the person's own orders and requests.
 * Returns only this user's rows — no cross-user aggregates.
 */
export const accountSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const orders = await ctx.db
      .query("orders")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    const byEmail = user.email
      ? await ctx.db.query("inquiries").withIndex("by_email", q => q.eq("email", user.email!)).collect()
      : [];

    const paid = orders.filter(o => o.status === "paid");
    const spendByCurrency: Record<string, number> = {};
    for (const o of paid) {
      const amount = (o.paidMinorAmount ?? o.minorAmount) / 100;
      spendByCurrency[o.currency] = (spendByCurrency[o.currency] ?? 0) + amount;
    }

    const timestamps = [
      ...orders.map(o => o.createdAt),
      ...byEmail.map(i => i.createdAt),
    ].filter(Boolean) as number[];

    return {
      profile: {
        name: user.name ?? null,
        email: user.email ?? null,
        country: user.country ?? null,
        countryCode: user.countryCode ?? null,
        city: user.city ?? null,
        timezone: user.timezone ?? null,
        locale: user.locale ?? null,
        currency: user.currency ?? null,
        company: user.company ?? null,
        phone: user.phone ?? null,
        sector: user.sector ?? null,
        goal: user.goal ?? null,
        onboarded: user.onboarded ?? false,
        isAnonymous: user.isAnonymous ?? false,
        memberSince: user.signedUpAt ?? user._creationTime,
      },
      stats: {
        orders: orders.length,
        paidOrders: paid.length,
        openRequests: byEmail.filter(i => i.status === "new").length,
        requests: byEmail.length,
        spendByCurrency,
        lastActivity: timestamps.length ? Math.max(...timestamps) : null,
      },
      orders: orders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20)
        .map(o => ({
          id: o._id,
          plan: o.plan,
          currency: o.currency,
          minorAmount: o.paidMinorAmount ?? o.minorAmount,
          status: o.status,
          createdAt: o.createdAt,
          receiptUrl: o.receiptUrl ?? null,
        })),
      requests: byEmail
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20)
        .map(i => ({
          id: i._id,
          mode: i.mode,
          business: i.business ?? null,
          message: i.message,
          status: i.status,
          createdAt: i.createdAt,
        })),
    };
  },
});

/** Lets someone correct what we inferred, or clear it entirely. */
export const updateRegion = mutation({
  args: {
    country: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, {
      ...(args.country !== undefined ? { country: args.country } : {}),
      ...(args.countryCode !== undefined ? { countryCode: args.countryCode } : {}),
      ...(args.city !== undefined ? { city: args.city.trim() || undefined } : {}),
      ...(args.timezone !== undefined ? { timezone: args.timezone } : {}),
      ...(args.currency !== undefined ? { currency: args.currency } : {}),
    });
  },
});

/** Wipes the location fields on request, without touching the account. */
export const clearRegion = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, {
      country: undefined, countryCode: undefined, city: undefined,
      timezone: undefined, locale: undefined,
    });
  },
});
