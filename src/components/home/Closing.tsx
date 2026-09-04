import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useMutation } from "convex/react";
import { backendConfigured } from "@/lib/backend";
import { api } from "@/convex/_generated/api";
import { FAQ, NAV, CONTACT_EMAIL, PROJECTS } from "./data";
import { Fade, Words, Magnetic } from "./motion";
import { Mark } from "./Chrome";

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/* ── FAQ ── */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="wx-section" aria-labelledby="faq-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="faq-title" className="wx-h2"><Words text="Questions people ask before they email." /></h2>
          <Fade as="p" className="wx-body" delay={200}>If yours isn't here, the form below is the fastest way to reach us.</Fade>
        </div>
        <div className="wx-faq" style={{ maxWidth: "52rem" }}>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <Fade key={f.q} className={`wx-faq__item ${isOpen ? "is-open" : ""}`} delay={i * 50}>
                <h3 style={{ margin: 0 }}>
                  <button className="wx-faq__q" aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </h3>
                <div className="wx-faq__a" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div><p className="wx-body">{f.a}</p></div>
                </div>
              </Fade>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ── */
export type BuildMode = "ai" | "human";

export function Contact({ mode, onModeChange }: { mode: BuildMode; onModeChange: (m: BuildMode) => void }) {
  const submitLive = useMutation(api.inquiries.submit);
  // Preview builds have nowhere to store a request, so the form completes
  // locally rather than hanging or bouncing the visitor into a mail client.
  const submit = backendConfigured
    ? submitLive
    : async (_args: Record<string, unknown>) => { await new Promise(r => setTimeout(r, 700)); };
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", business: "", message: "" });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending"); setError("");
    try {
      await submit({ ...form, mode, page: typeof window !== "undefined" ? window.location.pathname : "/" });
      setState("sent");
    } catch {
      // Backend unavailable: fall back to the visitor's mail client so nothing is lost.
      const body = encodeURIComponent(`Name: ${form.name}\nBusiness: ${form.business}\nI'd like to: ${mode === "ai" ? "build with AI" : "build with a human"}\n\n${form.message}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("New project: " + (form.business || form.name))}&body=${body}`;
      setState("error");
      setError("We couldn't reach our inbox directly, so we've opened your email app with the message ready to send.");
    }
  }

  return (
    <section id="contact" className="wx-section" aria-labelledby="contact-title">
      <div className="wx-container wx-contact">
        <div className="wx-contact__meta">
          <h2 id="contact-title" className="wx-h2"><Words text="Tell us what you're building." /></h2>
          <Fade as="p" className="wx-body" delay={200}>Send a few lines about your business and what the site needs to do. We reply within one business day with next steps, and a quote if you're building with us.</Fade>
          <Fade delay={300}>
            <address>
              <a className="wx-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <span className="wx-small">Replies Monday to Friday</span>
            </address>
          </Fade>
        </div>

        <Fade delay={150}>
          {state === "sent" ? (
            <div className="wx-sent" role="status" aria-live="polite">
              <Mark style={{ width: "2rem", height: "2rem", color: "var(--wx-copper)" }} />
              <h3 className="wx-h3">Request sent.</h3>
              <p className="wx-body">Thanks, {form.name.split(" ")[0] || "there"}. We'll be in touch within one business day. In the meantime, have a look at the <Link to={PROJECTS[0].href} className="wx-link">live demos</Link>.</p>
            </div>
          ) : (
            <form className="wx-form" onSubmit={onSubmit} noValidate={false}>
              <div className="wx-field">
                <span id="mode-label" style={{ fontSize: "0.875rem", color: "var(--wx-ash)" }}>I want to</span>
                <div className="wx-segment" role="group" aria-labelledby="mode-label">
                  <button type="button" aria-pressed={mode === "human"} onClick={() => onModeChange("human")}>Build with a human</button>
                  <button type="button" aria-pressed={mode === "ai"} onClick={() => onModeChange("ai")}>Build with AI</button>
                </div>
              </div>
              <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))" }}>
                <div className="wx-field"><label htmlFor="c-name">Your name</label><input id="c-name" name="name" autoComplete="name" required value={form.name} onChange={set("name")} /></div>
                <div className="wx-field"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} /></div>
              </div>
              <div className="wx-field"><label htmlFor="c-business">Business or project name</label><input id="c-business" name="business" autoComplete="organization" value={form.business} onChange={set("business")} /></div>
              <div className="wx-field"><label htmlFor="c-msg">What should the site do for you?</label><textarea id="c-msg" name="message" required placeholder="For example: we're a gym opening in March and need class bookings and memberships online." value={form.message} onChange={set("message")} /></div>
              {error && <p className="wx-form__status is-error" role="alert">{error}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <Magnetic type="submit" className={mode === "ai" ? "wx-btn--signal" : "wx-btn--copper"}>
                  {state === "sending" ? "Sending" : "Send request"} <Arrow />
                </Magnetic>
                <span className="wx-form__status">No newsletter, no follow-up sequence. Just a reply.</span>
              </div>
            </form>
          )}
        </Fade>
      </div>
    </section>
  );
}

/* ── Footer ── */
export function Footer() {
  return (
    <footer className="wx-footer" aria-label="Site footer">
      <div className="wx-container">
        <div className="wx-footer__grid">
          <div>
            <Link to="/" className="wx-brand" aria-label="WEBRIXO home"><Mark /><span>WEBRIXO</span></Link>
            <p className="wx-body" style={{ marginTop: "1rem", maxWidth: "36ch" }}>A two-person studio designing and building websites for small businesses and early software companies.</p>
          </div>
          <div className="wx-footer__col">
            <h3>Site</h3>
            <ul>{NAV.map(n => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}</ul>
          </div>
          <div className="wx-footer__col">
            <h3>Demos</h3>
            <ul>{PROJECTS.map(p => <li key={p.slug}><Link to={p.href}>{p.name}</Link></li>)}</ul>
          </div>
        </div>
        <div className="wx-footer__bottom">
          <span>© {new Date().getFullYear()} WEBRIXO</span>
          <span style={{ display: "flex", gap: "1.25rem" }}>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a href="https://instagram.com/webrixo" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#top">Back to top</a>
          </span>
        </div>
      </div>
      <div className="wx-footer__wordmark" aria-hidden="true">WEBRIXO</div>
    </footer>
  );
}

/* ── Cookie banner (dark variant) ── */
const KEY = "webrixo-cookie-consent";
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem(KEY)) setVisible(true); } catch { setVisible(true); } }, []);
  if (!visible) return null;
  const decide = (c: string) => { try { localStorage.setItem(KEY, c); } catch { /* ignore */ } setVisible(false); };
  return (
    <div className="wx-cookie" role="region" aria-label="Cookie notice">
      <p>We use a privacy-friendly analytics script and one cookie to remember this choice. No ad trackers. <Link to="/privacy">Privacy policy</Link></p>
      <div className="wx-cookie__actions">
        <button className="wx-btn wx-btn--sm" onClick={() => decide("accepted")}>Accept</button>
        <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => decide("declined")}>Decline</button>
      </div>
    </div>
  );
}
