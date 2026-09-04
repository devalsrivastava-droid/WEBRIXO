"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Generate a first version of someone's website from a sentence or two.
 *
 * With ANTHROPIC_API_KEY set (Convex dashboard → Settings → Environment
 * variables) this asks Claude for the plan. Without a key it still works: the
 * front end falls back to a local generator so the builder is never dead, and
 * says plainly which one produced the result.
 *
 * The model only ever returns content — headings, copy, section order, a
 * palette. It never returns code, so there is nothing executable coming back
 * from a model into the page.
 */

const SYSTEM = `You write website copy and structure for small businesses.

Return ONLY a JSON object, no prose, no markdown fences, matching exactly:
{
  "name": "business name, short",
  "tagline": "one sentence under 90 characters, plain language, no marketing cliches",
  "about": "two sentences, warm, specific, no buzzwords",
  "palette": "one of: warm, fresh, deep, cool, mono",
  "nav": ["3 to 5 short nav labels"],
  "cta": "2 to 4 word button label, an action",
  "sections": [
    { "kind": "one of: features, list, hours, steps, quote, contact",
      "title": "short heading",
      "items": [ { "title": "short", "body": "one sentence", "meta": "optional short right-hand text like a price or time" } ] }
  ],
  "footnote": "one short honest line"
}

Rules:
- 3 to 5 sections. Choose kinds that suit the business: a cafe needs a menu list and hours, a consultancy needs steps.
- 2 to 5 items per section.
- British spelling. No exclamation marks. No "elevate", "seamless", "unlock", "solutions", "journey".
- Write like a person describing their own business, not an agency describing a client.
- If they mention prices or times, use them. Never invent a price for a business that did not mention one.`;

export const site = action({
  args: { brief: v.string() },
  handler: async (_ctx, args): Promise<{ plan: unknown; source: "claude" }> => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("no-key");

    const brief = args.brief.trim().slice(0, 2000);
    if (brief.length < 12) throw new Error("Tell us a little more about the business first.");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1600,
        system: SYSTEM,
        messages: [{ role: "user", content: `Here is the business:\n\n${brief}` }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`generator-unavailable:${res.status}${detail ? ` ${detail.slice(0, 140)}` : ""}`);
    }

    const body = await res.json();
    const text: string = (body?.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim();

    // Models sometimes wrap JSON in fences despite instructions.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let plan: unknown;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
      if (start < 0 || end < 0) throw new Error("The generator returned something unexpected. Try again.");
      plan = JSON.parse(cleaned.slice(start, end + 1));
    }
    return { plan, source: "claude" };
  },
});
