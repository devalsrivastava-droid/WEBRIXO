/**
 * Preview mode.
 *
 * When the build has no Convex deployment behind it — the downloadable preview
 * file, or a checkout before `npx convex dev` has run — the sign-in, account
 * and contact flows would otherwise hang against a placeholder URL. This module
 * runs the same flows entirely in the browser so the site can be used and
 * demonstrated end to end.
 *
 * It is NOT authentication. Nothing here proves identity, and there is no
 * server to protect: with no backend there is also no real data to reach. The
 * moment `VITE_CONVEX_URL` points at a real deployment, `backendConfigured`
 * flips to true and none of this code is ever called. The UI says "Preview
 * mode" wherever it is active so it can't be mistaken for the real thing.
 */

import { useCallback, useEffect, useState } from "react";

export type DemoUser = {
  _id: string;
  name?: string;
  email?: string;
  isAnonymous?: boolean;
  onboarded?: boolean;
  country?: string;
  countryCode?: string;
  city?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  company?: string;
  sector?: string;
  goal?: string;
  signedUpAt?: number;
};

const KEY = "webrixo-preview-session";
const CODE_KEY = "webrixo-preview-code";

/** Everyone watching the same tab shares one session; a new tab starts fresh. */
function read(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch { return null; }
}

function write(user: DemoUser | null) {
  try {
    if (user) sessionStorage.setItem(KEY, JSON.stringify(user));
    else sessionStorage.removeItem(KEY);
  } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent("webrixo-preview-session"));
}

/** The code we'd have emailed. Shown on screen instead, since there's no mail. */
export function issuePreviewCode(email: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  try { sessionStorage.setItem(CODE_KEY, JSON.stringify({ email, code, at: Date.now() })); } catch { /* ignore */ }
  return code;
}

export function checkPreviewCode(email: string, entered: string) {
  try {
    const raw = sessionStorage.getItem(CODE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as { email: string; code: string; at: number };
    if (saved.email !== email) return false;
    if (Date.now() - saved.at > 15 * 60 * 1000) return false;
    return saved.code === entered;
  } catch { return false; }
}

export function previewSignIn(email?: string) {
  write({
    _id: "preview_user",
    email,
    isAnonymous: !email,
    onboarded: false,
    signedUpAt: Date.now(),
  });
}

export function previewSignOut() {
  write(null);
  try { sessionStorage.removeItem(CODE_KEY); } catch { /* ignore */ }
}

export function previewPatch(patch: Partial<DemoUser>) {
  const current = read();
  if (!current) return;
  write({ ...current, ...patch });
}

/** Mirrors the shape of the real `useAuth` so components need no branching. */
export function usePreviewAuth() {
  const [user, setUser] = useState<DemoUser | null>(() => read());

  useEffect(() => {
    const sync = () => setUser(read());
    window.addEventListener("webrixo-preview-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("webrixo-preview-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signIn = useCallback(async (provider: string, params?: FormData) => {
    if (provider === "anonymous") { previewSignIn(); return; }
    const email = String(params?.get("email") ?? "").trim().toLowerCase();
    const password = String(params?.get("password") ?? "");
    if (!email) throw new Error("Enter your email address.");
    if (password.length < 8) throw new Error("Passwords need at least 8 characters.");
    // Nothing to check against without a backend, so preview mode just lets
    // you in and remembers the address for the rest of the tab.
    previewSignIn(email);
  }, []);

  const signOut = useCallback(async () => { previewSignOut(); }, []);

  return { isLoading: false, isAuthenticated: Boolean(user), user, signIn, signOut };
}

/** Thrown instead of sending mail, carrying the code so the page can show it. */
export class PreviewCodeIssued extends Error {
  code: string;
  constructor(code: string) {
    super("preview-code-issued");
    this.name = "PreviewCodeIssued";
    this.code = code;
  }
}

/* ── Sample content for the account page in preview mode ─────────────────── */


export function previewAccountSummary(user: DemoUser | null) {
  if (!user) return null;
  const now = Date.now();
  return {
    profile: {
      name: user.name ?? null,
      email: user.email ?? null,
      country: user.country ?? null,
      countryCode: user.countryCode ?? null,
      city: user.city ?? null,
      timezone: user.timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || null),
      locale: user.locale ?? null,
      currency: user.currency ?? null,
      company: user.company ?? null,
      phone: null,
      sector: user.sector ?? null,
      goal: user.goal ?? null,
      onboarded: user.onboarded ?? false,
      isAnonymous: user.isAnonymous ?? false,
      memberSince: user.signedUpAt ?? now,
    },
    stats: {
      orders: 0,
      paidOrders: 0,
      openRequests: 0,
      requests: 0,
      spendByCurrency: {},
      lastActivity: null,
    },
    // Empty on purpose: inventing a payment history would be the same lie as
    // inventing testimonials. The empty states are part of the design.
    orders: [],
    requests: [],
    isPreview: true,
  };
}
