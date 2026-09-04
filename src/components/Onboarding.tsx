import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { backendConfigured } from "@/lib/backend";
import { previewPatch } from "@/lib/preview";
import { COUNTRIES, CURRENCIES, countryByCode, detectCountry, detectCurrency, localTimeIn, localeSignals, rememberCurrency, type CurrencyCode } from "@/lib/region";

const ease = [0.16, 1, 0.3, 1] as const;

const SECTORS = ["Café or restaurant", "Gym or studio", "Clinic or salon", "Shop or trade", "Software", "Something else"];
const GOALS = [
  { key: "found", label: "Be found on search", note: "People are looking for what you do and landing elsewhere." },
  { key: "bookings", label: "Take bookings or orders", note: "You want the site to do the scheduling, not the phone." },
  { key: "trust", label: "Look credible", note: "You have the customers; the site undersells you." },
  { key: "replace", label: "Replace an old site", note: "It works, it's just from another decade." },
];

/**
 * Four short steps. Everything we can infer is filled in already and shown
 * plainly, so the person is correcting a guess rather than filling a form.
 */
export default function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const completeLive = useMutation(api.users.completeOnboarding);
  const complete = backendConfigured
    ? completeLive
    : async (args: Record<string, unknown>) => { previewPatch({ ...args, onboarded: true }); };
  const signals = useMemo(() => localeSignals(), []);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [countryCode, setCountryCode] = useState(() => detectCountry());
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(() => detectCurrency());
  const [sector, setSector] = useState("");
  const [goal, setGoal] = useState("");

  const country = countryByCode(countryCode);

  // Changing country moves the currency with it, unless they've overridden it.
  const [currencyTouched, setCurrencyTouched] = useState(false);
  useEffect(() => {
    if (!currencyTouched) setCurrency(country.currency);
  }, [countryCode, country.currency, currencyTouched]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose, saving]);

  const canAdvance = step === 0 ? name.trim().length > 1 : step === 1 ? Boolean(countryCode) : true;

  async function finish() {
    setSaving(true); setError("");
    try {
      rememberCurrency(currency);
      await complete({
        name: name.trim(),
        country: country.name,
        countryCode,
        city: city.trim() || undefined,
        timezone: signals.timezone || undefined,
        locale: signals.locale || undefined,
        currency,
        company: company.trim() || undefined,
        sector: sector || undefined,
        goal: goal || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save that. Try again in a moment.");
      setSaving(false);
    }
  }

  const steps = ["You", "Where", "Work", "Goal"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="wx-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="wx-modal__card wx-onb" role="dialog" aria-modal="true" aria-labelledby="onb-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease }}>

            <div className="wx-onb__steps" aria-hidden="true">
              {steps.map((s, i) => (
                <span key={s} className={i === step ? "is-on" : i < step ? "is-done" : ""}>{s}</span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" className="wx-onb__body" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }}>
                  <h2 id="onb-title" className="wx-h3">Who are we talking to?</h2>
                  <p className="wx-body">So our replies come with your name on them, not "Hi there".</p>
                  <div className="wx-field"><label htmlFor="o-name">Your name</label><input id="o-name" autoFocus autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div className="wx-field"><label htmlFor="o-co">Business name <span className="wx-onb__opt">optional</span></label><input id="o-co" autoComplete="organization" value={company} onChange={e => setCompany(e.target.value)} /></div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" className="wx-onb__body" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }}>
                  <h2 className="wx-h3">Where are you?</h2>
                  <p className="wx-body">This sets your prices and stops us proposing a call at three in the morning your time.</p>

                  <div className="wx-onb__guess">
                    <b>We guessed {country.name}</b>
                    <span>
                      From your browser's timezone{signals.timezone ? ` (${signals.timezone}` : ""}
                      {signals.timezone && localTimeIn(signals.timezone) ? `, ${localTimeIn(signals.timezone)} for you now)` : signals.timezone ? ")" : ""}.
                      Change anything that's wrong.
                    </span>
                  </div>

                  <div className="wx-field">
                    <label htmlFor="o-country">Country</label>
                    <select id="o-country" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="wx-field"><label htmlFor="o-city">Town or city <span className="wx-onb__opt">optional</span></label><input id="o-city" autoComplete="address-level2" value={city} onChange={e => setCity(e.target.value)} placeholder="Helps if you want customers nearby to find you" /></div>
                  <div className="wx-field">
                    <label htmlFor="o-cur">Quote me in</label>
                    <select id="o-cur" value={currency} onChange={e => { setCurrency(e.target.value as CurrencyCode); setCurrencyTouched(true); }}>
                      {Object.values(CURRENCIES).map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" className="wx-onb__body" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }}>
                  <h2 className="wx-h3">What kind of business?</h2>
                  <p className="wx-body">We've built for most of these before, so it tells us which examples to send you.</p>
                  <div className="wx-onb__chips" role="group" aria-label="Kind of business">
                    {SECTORS.map(s => (
                      <button key={s} type="button" aria-pressed={sector === s} onClick={() => setSector(sector === s ? "" : s)}>{s}</button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" className="wx-onb__body" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }}>
                  <h2 className="wx-h3">What should the site fix?</h2>
                  <p className="wx-body">One thing is enough. It shapes the first call.</p>
                  <div className="wx-onb__goals" role="group" aria-label="Main goal">
                    {GOALS.map(g => (
                      <button key={g.key} type="button" aria-pressed={goal === g.key} onClick={() => setGoal(goal === g.key ? "" : g.key)}>
                        <b>{g.label}</b><span>{g.note}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="wx-form__status is-error" role="alert">{error}</p>}

            <div className="wx-onb__foot">
              {step > 0
                ? <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => setStep(s => s - 1)} disabled={saving}>Back</button>
                : <button className="wx-onb__skip" onClick={onClose}>Skip for now</button>}
              {step < 3
                ? <button className="wx-btn wx-btn--copper" onClick={() => setStep(s => s + 1)} disabled={!canAdvance}>Continue</button>
                : <button className="wx-btn wx-btn--copper" onClick={finish} disabled={saving}>{saving ? "Saving" : "Done"}</button>}
            </div>

            <p className="wx-modal__note">
              Four answers, kept to your account, used to quote and schedule. Not sold, not shared, and you can clear
              the location fields from your account page whenever you like.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
