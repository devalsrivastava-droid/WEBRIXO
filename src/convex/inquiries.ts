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
