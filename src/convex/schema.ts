import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // profile fields
      country: v.optional(v.string()),
      company: v.optional(v.string()),
      phone: v.optional(v.string()),
      bio: v.optional(v.string()),
      onboarded: v.optional(v.boolean()),

      // Where they are, for quoting and scheduling. All of this is either typed
      // by the person or read from signals the browser already sends; none of
      // it is precise location.
      countryCode: v.optional(v.string()),
      city: v.optional(v.string()),
      timezone: v.optional(v.string()),
      locale: v.optional(v.string()),
      currency: v.optional(v.string()),
      sector: v.optional(v.string()),
      goal: v.optional(v.string()),
      signedUpAt: v.optional(v.number()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    transactions: defineTable({
      userId: v.id("users"),
      amount: v.number(),
      description: v.string(),
      status: v.union(v.literal("completed"), v.literal("pending"), v.literal("failed")),
      date: v.number(),
      projectType: v.optional(v.string()),
    }).index("by_user", [
      "userId",
    ]),

    projects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      type: v.string(),
      status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused")),
      progress: v.number(),
      startDate: v.number(),
      deadline: v.optional(v.number()),
      budget: v.number(),
      description: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    activities: defineTable({
      userId: v.id("users"),
      type: v.string(),
      title: v.string(),
      detail: v.optional(v.string()),
      timestamp: v.number(),
    }).index("by_user", ["userId"]),

    notifications: defineTable({
      userId: v.id("users"),
      channel: v.string(),
      enabled: v.boolean(),
    }).index("by_user", ["userId"]),

    teamMembers: defineTable({
      userId: v.id("users"),
      name: v.string(),
      role: v.string(),
      email: v.string(),
      avatar: v.optional(v.string()),
      projectId: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    supportTickets: defineTable({
      userId: v.id("users"),
      subject: v.string(),
      status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      category: v.string(),
      messages: v.array(v.object({
        sender: v.string(),
        text: v.string(),
        timestamp: v.number(),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    documents: defineTable({
      userId: v.id("users"),
      name: v.string(),
      type: v.union(v.literal("invoice"), v.literal("proposal"), v.literal("contract"), v.literal("receipt"), v.literal("report")),
      size: v.string(),
      projectId: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Contact / project requests from the homepage form
    inquiries: defineTable({
      name: v.string(),
      email: v.string(),
      business: v.optional(v.string()),
      message: v.string(),
      mode: v.union(v.literal("ai"), v.literal("human")),
      page: v.optional(v.string()),
      userId: v.optional(v.id("users")),
      status: v.union(v.literal("new"), v.literal("replied"), v.literal("closed")),
      createdAt: v.number(),
    }).index("by_status", ["status"]).index("by_email", ["email"]),

    // Deposits taken through Stripe (worldwide) or Razorpay (India).
    orders: defineTable({
      plan: v.string(),
      currency: v.string(),
      minorAmount: v.number(),
      paidMinorAmount: v.optional(v.number()),
      email: v.string(),
      name: v.optional(v.string()),
      business: v.optional(v.string()),
      provider: v.string(),
      providerId: v.optional(v.string()),
      status: v.union(v.literal("started"), v.literal("paid"), v.literal("failed"), v.literal("refunded")),
      failureReason: v.optional(v.string()),
      receiptUrl: v.optional(v.string()),
      userId: v.optional(v.id("users")),
      createdAt: v.number(),
      paidAt: v.optional(v.number()),
    }).index("by_provider_id", ["providerId"]).index("by_email", ["email"]).index("by_status", ["status"]),

    usage: defineTable({
      userId: v.id("users"),
      metric: v.string(),
      current: v.number(),
      limit: v.number(),
      unit: v.string(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
