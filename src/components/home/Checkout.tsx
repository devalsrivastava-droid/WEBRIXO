import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { backendConfigured } from "@/lib/backend";
import { CURRENCIES, convert, detectCurrency, rememberCurrency, regionLabel, storedCurrency, type CurrencyCode } from "@/lib/region";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * One shared currency choice for the page. Guessed from the browser's timezone
 * and language on first paint, overridable by the visitor, remembered after.
 */
export function useCurrency() {
  const [code, setCode] = useState<CurrencyCode>("USD");
  const [guessed, setGuessed] = useState(true);
  useEffect(() => {
    const stored = storedCurrency();
    if (stored) { setCode(stored); setGuessed(false); return; }
    setCode(detectCurrency());
  }, []);
  const choose = (next: CurrencyCode) => { setCode(next); setGuessed(false); rememberCurrency(next); };
  return { code, guessed, choose };
}

export function CurrencySwitcher({ code, guessed, onChoose }: {
  code: CurrencyCode; guessed: boolean; onChoose: (c: CurrencyCode) => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".wx-cur")) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", close); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); window.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="wx-cur">
      <button className="wx-cur__btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="listbox">
        <span className="wx-cur__dot" aria-hidden="true" />
        {guessed ? `Prices in ${code} for ${regionLabel(code)}` : `Prices in ${code}`}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul className="wx-cur__menu" role="listbox" aria-label="Choose a currency"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease }}>
            {Object.values(CURRENCIES).map(c => (
              <li key={c.code}>
                <button role="option" aria-selected={c.code === code} onClick={() => { onChoose(c.code); setOpen(false); }}>
                  <b>{c.code}</b><span>{c.label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Deposit checkout ───────────────────────────────────────────────────────
   Collects only what a receipt needs, then hands off to Stripe or Razorpay.
   Card details are entered on the provider's own page, never here. */
export type PlanKey = "starter" | "studio" | "care";

export function Checkout({ plan, planName, baseInr, depositInr, code, onClose }: {
  plan: PlanKey; planName: string; baseInr: number; depositInr: number; code: CurrencyCode; onClose: () => void;
}) {
  const createCheckout = useAction(api.payments.createCheckout);
  const [previewDone, setPreviewDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", business: "" });
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const deposit = convert(depositInr, code);
  const total = convert(baseInr, code);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && state !== "sending") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose, state]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending"); setError("");
    if (!backendConfigured) {
      // No deployment, so no Stripe or Razorpay session to open. Show what
      // would happen instead of throwing an error at the visitor.
      await new Promise(r => setTimeout(r, 700));
      setPreviewDone(true); setState("idle");
      return;
    }
    try {
      const { url } = await createCheckout({
        plan, currency: code, minorAmount: deposit.minorAmount,
        email: form.email.trim(), name: form.name.trim() || undefined, business: form.business.trim() || undefined,
      });
      window.location.href = url;
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "We couldn't open the payment page. Email hello@webrixo.com and we'll send an invoice instead.");
    }
  }

  return (
    <motion.div className="wx-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      onClick={() => state !== "sending" && onClose()}>
      <motion.div className="wx-modal__card" role="dialog" aria-modal="true" aria-labelledby="pay-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.4, ease }} onClick={e => e.stopPropagation()}>
        <button className="wx-modal__x" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>

        {previewDone ? (
          <>
            <h2 className="wx-h3">Preview mode</h2>
            <p className="wx-body">
              On the live site this hands you to {code === "INR" ? "Razorpay" : "Stripe"} to pay the {deposit.display} deposit,
              and the payment shows up in your account within seconds. There's no payment provider behind this preview file.
            </p>
            <button className="wx-btn wx-btn--ghost" onClick={onClose}>Close</button>
          </>
        ) : (
        <>
        <h2 id="pay-title" className="wx-h3">Book {planName}</h2>
        <p className="wx-body">You're paying a deposit to hold the work, not the full amount. We start within a week, and you get it back if we decide we're not the right fit.</p>

        <dl className="wx-modal__sum">
          <div><dt>Deposit today</dt><dd><b>{deposit.display}</b></dd></div>
          <div><dt>{plan === "care" ? "Then monthly" : "Balance on launch"}</dt><dd>{plan === "care" ? total.display : convert(baseInr - depositInr, code).display}</dd></div>
        </dl>

        <form className="wx-form" onSubmit={submit}>
          <div className="wx-field"><label htmlFor="p-name">Your name</label><input id="p-name" autoComplete="name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="wx-field"><label htmlFor="p-email">Email for the receipt</label><input id="p-email" type="email" autoComplete="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="wx-field"><label htmlFor="p-biz">Business name</label><input id="p-biz" autoComplete="organization" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} /></div>
          {error && <p className="wx-form__status is-error" role="alert">{error}</p>}
          <button type="submit" className="wx-btn wx-btn--copper" disabled={state === "sending"}>
            {state === "sending" ? "Opening secure checkout" : `Pay ${deposit.display} deposit`}
          </button>
          <p className="wx-modal__note">
            Card details are entered on {code === "INR" ? "Razorpay" : "Stripe"}'s own page — they never touch this site.
            Prefer a bank transfer or an invoice? <a className="wx-link" href="mailto:hello@webrixo.com">Email us</a>.
          </p>
        </form>
        </>
        )}
      </motion.div>
    </motion.div>
  );
}
