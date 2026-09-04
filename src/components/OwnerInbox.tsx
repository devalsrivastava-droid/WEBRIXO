import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { backendConfigured } from "@/lib/backend";
import { CURRENCIES, format, type CurrencyCode } from "@/lib/region";

const ease = [0.16, 1, 0.3, 1] as const;

type Row = {
  id: string; name: string; email: string; phone: string | null;
  contactVia: "email" | "phone" | "whatsapp"; business: string | null; message: string;
  mode: string; status: string; relevant: boolean | null;
  offeredMinor: number | null; agreedMinor: number | null; currency: string;
  ownerNote: string | null; createdAt: number; approvedAt: number | null;
};

function when(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  const d = Math.floor(mins / 1440);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

/**
 * The owner's inbox.
 *
 * Everything that arrives is kept. Sorting happens between two tabs, never by
 * deletion, so a genuine enquiry phrased casually can't be silently binned —
 * it's just one tab away, one click from being moved back.
 *
 * Pricing is the owner's decision. Nothing here proposes or accepts a number.
 */
export default function OwnerInbox() {
  const rows = useQuery(api.inquiries.inbox, backendConfigured ? {} : "skip") as Row[] | null | undefined;
  const approve = useMutation(api.inquiries.approve);
  const setStatus = useMutation(api.inquiries.setStatus);

  const [tab, setTab] = useState<"reply" | "other" | "queue">("reply");
  const [openId, setOpenId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { reply, other, queue } = useMemo(() => {
    const list = rows ?? [];
    return {
      reply: list.filter(r => r.relevant !== false && !["approved", "queued", "closed"].includes(r.status)),
      other: list.filter(r => r.relevant === false),
      queue: list.filter(r => r.status === "approved" || r.status === "queued"),
    };
  }, [rows]);

  if (rows === undefined) return <section className="wx-acc__panel"><p className="wx-small">Loading your inbox…</p></section>;
  if (rows === null) return null;   // not an admin

  const shown = tab === "reply" ? reply : tab === "other" ? other : queue;
  const open = shown.find(r => r.id === openId) ?? null;

  async function doApprove(r: Row) {
    const code = (r.currency as CurrencyCode) in CURRENCIES ? (r.currency as CurrencyCode) : "INR";
    const num = Number(price.replace(/[^\d.]/g, ""));
    if (!num) { setErr("Enter the price you're agreeing to."); return; }
    setBusy(true); setErr("");
    try {
      await approve({ id: r.id as never, agreedMinor: Math.round(num * (CURRENCIES[code]?.minor ?? 100)), currency: code, ownerNote: note });
      setOpenId(null); setPrice(""); setNote("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save that.");
    } finally { setBusy(false); }
  }

  return (
    <section className="wx-acc__panel wx-inbox" aria-labelledby="inbox-title">
      <div className="wx-acc__panelHead">
        <h2 id="inbox-title" className="wx-h3">Messages</h2>
        <div className="wx-inbox__tabs" role="tablist">
          {([["reply", "Needs a reply", reply.length], ["other", "Probably not", other.length], ["queue", "Queue", queue.length]] as const).map(([k, label, n]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "is-on" : ""} onClick={() => { setTab(k); setOpenId(null); }}>
              {label}{n > 0 && <i>{n}</i>}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="wx-small">
          {tab === "reply" ? "Nothing waiting. Messages from the site land here." :
           tab === "other" ? "Nothing sorted out of the way yet. Anything you move here stays readable." :
           "No approved projects yet. Once you agree a price, the project appears here."}
        </p>
      ) : (
        <ul className="wx-inbox__list">
          {shown.map(r => (
            <li key={r.id}>
              <button className={`wx-inbox__row ${openId === r.id ? "is-open" : ""}`} onClick={() => { setOpenId(openId === r.id ? null : r.id); setPrice(""); setNote(""); setErr(""); }}>
                <span className="wx-inbox__who">
                  <b>{r.business || r.name}</b>
                  <span className="wx-small">{r.name} · {when(r.createdAt)}</span>
                </span>
                <span className="wx-inbox__tags">
                  {r.offeredMinor && <span className="wx-tag">offered {format(r.offeredMinor / 100, (r.currency as CurrencyCode) ?? "INR")}</span>}
                  {r.agreedMinor && <span className="wx-tag is-paid">agreed {format(r.agreedMinor / 100, (r.currency as CurrencyCode) ?? "INR")}</span>}
                  <span className={`wx-tag is-${r.status}`}>{r.status}</span>
                </span>
              </button>

              <AnimatePresence>
                {openId === r.id && (
                  <motion.div className="wx-inbox__detail" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease }}>
                    <p className="wx-body wx-inbox__msg">{r.message}</p>

                    <dl className="wx-inbox__facts">
                      <div><dt>Reply to</dt><dd><a className="wx-link" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
                      {r.phone && <div><dt>{r.contactVia === "whatsapp" ? "WhatsApp" : "Phone"}</dt><dd>{r.phone}</dd></div>}
                      <div><dt>Prefers</dt><dd>{r.contactVia}</dd></div>
                      <div><dt>Route</dt><dd>{r.mode === "ai" ? "Build with AI" : "Build with a human"}</dd></div>
                    </dl>

                    {r.status !== "approved" && r.status !== "queued" ? (
                      <div className="wx-inbox__approve">
                        <div className="wx-field">
                          <label htmlFor={`p-${r.id}`}>Price you're agreeing to ({r.currency})</label>
                          <input id={`p-${r.id}`} inputMode="numeric" value={price} onChange={e => setPrice(e.target.value)}
                            placeholder={r.offeredMinor ? String(Math.round(r.offeredMinor / 100)) : ""} />
                        </div>
                        <div className="wx-field">
                          <label htmlFor={`n-${r.id}`}>A line for them (optional)</label>
                          <input id={`n-${r.id}`} value={note} onChange={e => setNote(e.target.value)} placeholder="Happy to do it at this — can start Monday." />
                        </div>
                        {err && <p className="wx-form__status is-error">{err}</p>}
                        <div className="wx-inbox__actions">
                          <button className="wx-btn wx-btn--copper wx-btn--sm" disabled={busy} onClick={() => doApprove(r)}>
                            {busy ? "Saving" : "Approve at this price"}
                          </button>
                          <a className="wx-btn wx-btn--ghost wx-btn--sm" href={`mailto:${r.email}?subject=${encodeURIComponent("Re: your website")}`}>Reply by email</a>
                          {r.relevant !== false
                            ? <button className="wx-inbox__move" onClick={() => setStatus({ id: r.id as never, relevant: false })}>Not relevant</button>
                            : <button className="wx-inbox__move" onClick={() => setStatus({ id: r.id as never, relevant: true })}>Move back</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="wx-inbox__approve">
                        <p className="wx-small">
                          Approved at {r.agreedMinor ? format(r.agreedMinor / 100, (r.currency as CurrencyCode) ?? "INR") : "—"}
                          {r.approvedAt ? ` · ${when(r.approvedAt)}` : ""}. They can see the price and pay from their account.
                        </p>
                        <div className="wx-inbox__actions">
                          {r.status === "approved" && <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => setStatus({ id: r.id as never, status: "queued" })}>Mark as queued</button>}
                          <button className="wx-inbox__move" onClick={() => setStatus({ id: r.id as never, status: "closed" })}>Close thread</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
