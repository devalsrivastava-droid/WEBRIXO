import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { backendConfigured } from "@/lib/backend";
import { previewAccountSummary, previewPatch } from "@/lib/preview";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Mark } from "@/components/home/Chrome";
import OwnerInbox from "@/components/OwnerInbox";
import { COUNTRIES, CURRENCIES, countryByCode, format, localTimeIn, type CurrencyCode } from "@/lib/region";
import "@/styles/home.css";

const ease = [0.16, 1, 0.3, 1] as const;

type OrderRow = { id: string; plan: string; currency: string; minorAmount: number; status: string; createdAt: number; receiptUrl: string | null };
type RequestRow = { id: string; mode: string; business: string | null; message: string; status: string; createdAt: number };

const PLAN_NAMES: Record<string, string> = { starter: "Starter", studio: "Studio", care: "Care" };
const GOAL_NAMES: Record<string, string> = {
  found: "Be found on search",
  bookings: "Take bookings or orders",
  trust: "Look credible",
  replace: "Replace an old site",
};

function when(ts: number | null) {
  if (!ts) return "—";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="wx-acc__stat">
      <div className="wx-acc__statN">{value}</div>
      <h3>{label}</h3>
      {note && <p className="wx-small">{note}</p>}
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const live = useQuery(api.users.accountSummary, backendConfigured ? {} : "skip");
  const updateRegionLive = useMutation(api.users.updateRegion);
  const clearRegionLive = useMutation(api.users.clearRegion);

  // Without a deployment there is nothing to query, so the page runs on the
  // same shape filled with sample rows and says so.
  const data = backendConfigured ? live : previewAccountSummary(user ?? null);
  const updateRegion = backendConfigured
    ? updateRegionLive
    : async (patch: { country?: string; countryCode?: string; city?: string; currency?: string }) => { previewPatch(patch); };
  const clearRegion = backendConfigured
    ? clearRegionLive
    : async () => { previewPatch({ country: undefined, countryCode: undefined, city: undefined, timezone: undefined }); };

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ countryCode: "XX", city: "", currency: "USD" as CurrencyCode });

  usePageMeta({ title: "Your account | WEBRIXO", description: "Your projects, payments and details.", path: "/account" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?returnTo=/account", { replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!data) return;
    setDraft({
      countryCode: data.profile.countryCode ?? "XX",
      city: data.profile.city ?? "",
      currency: (data.profile.currency as CurrencyCode) ?? "USD",
    });
  }, [data]);

  if (isLoading || data === undefined) {
    return <div className="wx wx-acc"><div className="wx-acc__loading">Loading your account…</div></div>;
  }
  if (!data) return null;

  const { profile, stats, orders, requests } = data;
  const country = countryByCode(profile.countryCode ?? "XX");
  const spend = Object.entries(stats.spendByCurrency as Record<string, number>);

  async function save() {
    const c = countryByCode(draft.countryCode);
    await updateRegion({ country: c.name, countryCode: draft.countryCode, city: draft.city, currency: draft.currency });
    setEditing(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="wx wx-acc">
      <header className="wx-auth__bar">
        <Link to="/" className="wx-brand" aria-label="WEBRIXO home"><Mark /><span>WEBRIXO</span></Link>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/" className="wx-btn wx-btn--ghost wx-btn--sm">Back to site</Link>
          <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => { signOut(); navigate("/"); }}>Sign out</button>
        </div>
      </header>

      <main className="wx-container wx-acc__main" id="main">
        {!backendConfigured && (
          <div className="wx-notice" role="status">
            <b>Preview mode</b>
            <span>These numbers are sample data so you can see the layout. On the live site every figure comes from your own orders and requests.</span>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className="wx-small">{profile.email ?? "Guest account"}</p>
          <h1 className="wx-h2">{profile.name ? `Hello, ${profile.name.split(" ")[0]}.` : "Your account"}</h1>
          <p className="wx-body" style={{ marginTop: "0.75rem" }}>
            Everything we hold about you, and everything you've sent us. Member since {when(profile.memberSince)}.
          </p>
        </motion.div>

        <section className="wx-acc__stats" aria-label="Your numbers">
          <Stat label="Projects booked" value={String(stats.paidOrders)} note={stats.orders > stats.paidOrders ? `${stats.orders - stats.paidOrders} not completed` : "Deposits paid"} />
          <Stat label="Requests sent" value={String(stats.requests)} note={stats.openRequests ? `${stats.openRequests} awaiting our reply` : "All replied to"} />
          <Stat
            label="Paid to date"
            value={spend.length ? spend.map(([cur, amt]) => format(amt, cur as CurrencyCode)).join(" · ") : "—"}
            note={spend.length ? "Across all deposits" : "Nothing yet"}
          />
          <Stat label="Last activity" value={when(stats.lastActivity)} note={profile.timezone ? `${localTimeIn(profile.timezone)} where you are` : undefined} />
        </section>

        <OwnerInbox />

        <div className="wx-acc__grid">
          <section className="wx-acc__panel" aria-labelledby="details-title">
            <div className="wx-acc__panelHead">
              <h2 id="details-title" className="wx-h3">Your details</h2>
              {!editing && <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => setEditing(true)}>Edit</button>}
            </div>

            {editing ? (
              <div className="wx-form">
                <div className="wx-field">
                  <label htmlFor="a-country">Country</label>
                  <select id="a-country" value={draft.countryCode} onChange={e => setDraft(d => ({ ...d, countryCode: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="wx-field">
                  <label htmlFor="a-city">Town or city</label>
                  <input id="a-city" value={draft.city} onChange={e => setDraft(d => ({ ...d, city: e.target.value }))} />
                </div>
                <div className="wx-field">
                  <label htmlFor="a-cur">Quote me in</label>
                  <select id="a-cur" value={draft.currency} onChange={e => setDraft(d => ({ ...d, currency: e.target.value as CurrencyCode }))}>
                    {Object.values(CURRENCIES).map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button className="wx-btn wx-btn--copper wx-btn--sm" onClick={save}>Save</button>
                  <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <dl className="wx-acc__rows">
                <div><dt>Name</dt><dd>{profile.name ?? "—"}</dd></div>
                <div><dt>Email</dt><dd>{profile.email ?? "—"}</dd></div>
                <div><dt>Business</dt><dd>{profile.company ?? "—"}</dd></div>
                <div><dt>Country</dt><dd>{profile.country ?? "—"}</dd></div>
                <div><dt>City</dt><dd>{profile.city ?? "—"}</dd></div>
                <div><dt>Timezone</dt><dd>{profile.timezone ? `${profile.timezone} · ${localTimeIn(profile.timezone)}` : "—"}</dd></div>
                <div><dt>Currency</dt><dd>{profile.currency ?? country.currency}</dd></div>
                <div><dt>Sector</dt><dd>{profile.sector ?? "—"}</dd></div>
                <div><dt>Main goal</dt><dd>{profile.goal ? GOAL_NAMES[profile.goal] ?? profile.goal : "—"}</dd></div>
              </dl>
            )}

            {saved && <p className="wx-acc__saved" role="status">Saved.</p>}

            <div className="wx-acc__privacy">
              <p className="wx-small">
                Country, city and timezone are used to quote you in the right currency and to suggest call times you'd
                actually be awake for. Nothing here is sold or shared.
              </p>
              <button className="wx-acc__clear" onClick={() => clearRegion()}>Clear my location details</button>
            </div>
          </section>

          <div className="wx-acc__side">
            <section className="wx-acc__panel" aria-labelledby="orders-title">
              <h2 id="orders-title" className="wx-h3">Payments</h2>
              {orders.length === 0 ? (
                <div className="wx-acc__empty">
                  <p className="wx-body">No payments yet. When you book a project, the deposit and receipt show up here.</p>
                  <Link to="/#pricing" className="wx-btn wx-btn--ghost wx-btn--sm">See pricing</Link>
                </div>
              ) : (
                <ul className="wx-acc__list">
                  {(orders as OrderRow[]).map((o: OrderRow) => (
                    <li key={o.id}>
                      <div>
                        <b>{PLAN_NAMES[o.plan] ?? o.plan}</b>
                        <span className="wx-small">{when(o.createdAt)}</span>
                      </div>
                      <div className="wx-acc__listRight">
                        <b>{format(o.minorAmount / 100, o.currency as CurrencyCode)}</b>
                        <span className={`wx-tag is-${o.status}`}>{o.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="wx-acc__panel" aria-labelledby="req-title">
              <h2 id="req-title" className="wx-h3">Your requests</h2>
              {requests.length === 0 ? (
                <div className="wx-acc__empty">
                  <p className="wx-body">Nothing sent yet. Tell us what you're building and we'll reply within a business day.</p>
                  <Link to="/#contact" className="wx-btn wx-btn--ghost wx-btn--sm">Start a project</Link>
                </div>
              ) : (
                <ul className="wx-acc__list wx-acc__list--stack">
                  {(requests as RequestRow[]).map((r: RequestRow) => (
                    <li key={r.id}>
                      <div>
                        <b>{r.business || (r.mode === "ai" ? "Build with AI" : "Build with a human")}</b>
                        <span className="wx-small">{when(r.createdAt)}</span>
                      </div>
                      <p className="wx-small wx-acc__quote">{r.message.length > 140 ? r.message.slice(0, 140) + "…" : r.message}</p>
                      <span className={`wx-tag is-${r.status}`}>{r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
