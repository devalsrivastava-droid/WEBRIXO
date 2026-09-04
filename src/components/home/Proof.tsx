import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { convert, isHomeMarket } from "@/lib/region";
import { Checkout, CurrencySwitcher, useCurrency, type PlanKey } from "./Checkout";
import Configurator from "./Configurator";
import { Fade, Words, Magnetic, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
const Tick = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5 9 17.5 20 6.5" /></svg>;

/* ── A number that counts up once, when it scrolls into view ── */
export function Counter({ to, prefix = "", suffix = "", duration = 1.6, decimals = 0 }: {
  to: number; prefix?: string; suffix?: string; duration?: number; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (v: number) => { el.textContent = prefix + v.toFixed(decimals) + suffix; };
    if (prefersReducedMotion()) { write(to); return; }
    write(0);
    const o = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(o, { v: to, duration, ease: "power2.out", onUpdate: () => write(o.v) }),
    });
    return () => st.kill();
  }, [to, prefix, suffix, duration, decimals]);
  return <span ref={ref} className="wx-num">{prefix}{to}{suffix}</span>;
}

/* ── Stats strip ── */
const STATS = [
  { to: 0.9, suffix: "s", decimals: 1, label: "This page, loaded on a phone", note: "Measure it yourself. Yours would be built the same way." },
  { to: 4, suffix: " weeks", label: "Brief to launch, at the outside", note: "Two if your words and photos are ready." },
  { to: 100, suffix: "%", label: "Yours at handover", note: "Hosting and domain in your name. Nothing locked to us." },
  { to: 1, label: "Person you'll ever talk to", note: "The same one who builds it." },
];

export function Stats() {
  return (
    <section className="wx-stats" aria-label="Studio numbers">
      <div className="wx-container wx-stats__grid">
        {STATS.map((s, i) => (
          <Fade key={s.label} className="wx-stat" delay={i * 80}>
            <div className="wx-stat__n"><Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} /></div>
            <h3>{s.label}</h3>
            <p className="wx-small">{s.note}</p>
          </Fade>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ── */
const PLANS: {
  key: PlanKey; name: string; baseInr: number; depositInr: number; per?: string;
  tag: string; body: string; includes: string[]; cta: string; accent: string; best?: boolean;
}[] = [
  {
    key: "starter",
    name: "Starter",
    baseInr: 25000,
    depositInr: 7500,
    tag: "One page",
    body: "A single, well-made page for a business that mostly needs to be found, trusted and called.",
    includes: ["One long page, up to six sections", "Copy written with you", "Contact or booking form", "Search setup and analytics", "Live in about one week"],
    cta: "Book Starter",
    accent: "var(--wx-ash)",
  },
  {
    key: "studio",
    name: "Studio",
    baseInr: 75000,
    depositInr: 20000,
    tag: "Most projects",
    body: "The full site: several pages, your own words and photos, and everything set up so people can find you.",
    includes: ["Up to six pages, designed individually", "Copy and content written with you", "Bookings, menus or class timetables", "Search setup, analytics and speed work", "One month of changes after launch"],
    cta: "Book Studio",
    accent: "var(--wx-copper)",
    best: true,
  },
  {
    key: "care",
    name: "Care",
    baseInr: 4000,
    depositInr: 4000,
    per: "/month",
    tag: "After launch",
    body: "Hosting, updates and small changes so the site keeps earning its place. Cancel any month.",
    includes: ["Hosting, domain and certificates", "Content changes when you need them", "Monthly speed and search check", "Backups and updates", "Replies within one business day"],
    cta: "Start Care",
    accent: "var(--wx-signal)",
  },
];

export function Pricing({ onStart }: { onStart: () => void }) {
  const root = useRef<HTMLElement>(null);
  const { code, guessed, choose } = useCurrency();
  const [buying, setBuying] = useState<PlanKey | null>(null);
  useEffect(() => {
    const r = root.current;
    if (!r || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>(".wx-plan", r);
    const tw = gsap.fromTo(cards, { y: 60, opacity: 0, rotateX: 8 }, {
      y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: r, start: "top 72%", once: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, []);
  const open = PLANS.find(p => p.key === buying);
  return (
    <section ref={root} id="pricing" className="wx-section" aria-labelledby="pricing-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="pricing-title" className="wx-h2"><Words text="Prices on the website, like everything else should be." /></h2>
          <Fade as="div" delay={200}>
            <p className="wx-body">These are real starting prices, not "from" numbers that triple on the call. You get a fixed quote before anything begins.</p>
            <div style={{ marginTop: "1rem" }}>
              <CurrencySwitcher code={code} guessed={guessed} onChoose={choose} />
            </div>
          </Fade>
        </div>
        <div className="wx-plans">
          {PLANS.map(p => {
            const price = convert(p.baseInr, code);
            const deposit = convert(p.depositInr, code);
            return (
              <article key={p.key} className={`wx-plan ${p.best ? "is-best" : ""}`} style={{ ["--plan-accent" as string]: p.accent }}>
                {p.best && <span className="wx-plan__flag">Most projects</span>}
                <header className="wx-plan__head">
                  <h3>{p.name}</h3>
                  <span className="wx-small">{p.tag}</span>
                </header>
                <div className="wx-plan__price"><b>{price.display}</b>{p.per && <span>{p.per}</span>}</div>
                <p className="wx-body">{p.body}</p>
                <ul className="wx-plan__list">
                  {p.includes.map(i => <li key={i}><i aria-hidden="true"><Tick /></i>{i}</li>)}
                </ul>
                <div className="wx-plan__foot">
                  <Magnetic className={p.best ? "wx-btn--copper" : "wx-btn--ghost"} onClick={() => setBuying(p.key)}>{p.cta} <Arrow /></Magnetic>
                  <button className="wx-plan__alt" onClick={onStart}>
                    {p.key === "care" ? `${deposit.display} a month, cancel anytime` : `${deposit.display} deposit, or talk first`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <Fade delay={180} className="wx-conf__wrap">
          <div className="wx-conf__intro">
            <h3 className="wx-h3">None of those quite fit?</h3>
            <p className="wx-body">Describe the project in your own words below and we'll price what you actually asked for.</p>
          </div>
          <Configurator code={code} />
        </Fade>

        <Fade as="p" className="wx-small wx-plans__note" delay={150}>
          {isHomeMarket(code)
            ? "Prices include everything described. GST is added where it applies. Photography, illustration and paid tools are quoted separately, and we tell you before you commit."
            : `Shown in ${code}, converted from our rupee prices and rounded. We bill the exact amount at checkout, and taxes in your country are added there if they apply.`}
        </Fade>
      </div>
      <AnimatePresence>
        {open && (
          <Checkout
            key={open.key}
            plan={open.key}
            planName={open.name}
            baseInr={open.baseInr}
            depositInr={open.depositInr}
            code={code}
            onClose={() => setBuying(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Instead of testimonials ────────────────────────────────────────────────
   A new studio has no clients yet, and invented quotes are both a lie and
   obvious. These are claims a visitor can check on this page, right now. */
const PROOFS = [
  {
    claim: "Check the speed yourself",
    body: "Open your browser's dev tools on this page, or run it through PageSpeed Insights. We are not going to tell you a site is fast and then hand you a slow one.",
    action: "Run PageSpeed on this page",
    href: "https://pagespeed.web.dev/",
  },
  {
    claim: "Ask before you commit",
    body: "Send a question and see how fast the answer comes back, and whether it sounds like a person. That is what working together would feel like.",
    action: "Ask us something",
    href: "#contact",
  },
  {
    claim: "Use the demos properly",
    body: "Four concept builds, live and clickable. Resize them, open them on a phone, tab through them with a keyboard. They are built the way your site would be.",
    action: "Open a demo",
    href: "/demos/brew",
  },
];

export function Proof() {
  return (
    <section id="proof" className="wx-section" aria-labelledby="proof-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="proof-title" className="wx-h2"><Words text="No testimonials. We just started." /></h2>
          <Fade as="p" className="wx-body" delay={200}>
            Every new studio's website has five glowing quotes from people you cannot verify. Here is what we can
            offer instead: things you can check without taking our word for any of it.
          </Fade>
        </div>
        <div className="wx-proofs">
          {PROOFS.map((p, i) => (
            <Fade key={p.claim} className="wx-proof" delay={i * 90}>
              <h3 className="wx-h3">{p.claim}</h3>
              <p className="wx-body">{p.body}</p>
              <a className="wx-link" href={p.href} target={p.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{p.action}</a>
            </Fade>
          ))}
        </div>
        <Fade delay={300}>
          <p className="wx-proof__note">
            When there are real clients, their names go here and you will be able to visit their sites. Until then this
            space stays honest.
          </p>
        </Fade>
      </div>
    </section>
  );
}

/* ── Who you are actually hiring ── */
export function Team() {
  return (
    <section id="studio" className="wx-section" aria-labelledby="team-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="team-title" className="wx-h2"><Words text="You already know who is building it." /></h2>
          <Fade as="p" className="wx-body" delay={200}>
            No account manager, no handover to a team you never met, no junior taking over once the contract is signed.
          </Fade>
        </div>
        <div className="wx-solo">
          <Fade className="wx-member" style={{ ["--m-accent" as string]: "var(--wx-copper)" }}>
            <div className="wx-member__top">
              <span className="wx-member__avatar" aria-hidden="true">WX</span>
              <div>
                <h3>The owner</h3>
                <p className="wx-small">Designer, developer, and the person who replies</p>
              </div>
            </div>
            <p className="wx-body">
              One person designs the pages, writes the code, and argues for one less section on every project.
              WEBRIXO is new, which means two things: you get undivided attention, and the pricing of someone
              building a portfolio rather than protecting a rate card.
            </p>
            <ul className="wx-member__does">
              {["Design", "Front-end", "Motion", "Copy", "Search setup"].map(d => <li key={d}>{d}</li>)}
            </ul>
            <div className="wx-member__line"><span>Based in</span><span>Thane, India</span></div>
            <div className="wx-member__line"><span>Reply time</span><span>One business day</span></div>
          </Fade>
          <Fade className="wx-solo__aside" delay={120}>
            <h3 className="wx-h3">What "new" actually means for you</h3>
            <ul className="wx-solo__list">
              <li><b>Lower prices.</b> These rates exist because I am building a portfolio, and they will not last.</li>
              <li><b>Faster replies.</b> There is no queue in front of you.</li>
              <li><b>More care than the fee justifies.</b> Your site is going to be one of the first things anyone sees when they look me up.</li>
              <li><b>The honest risk.</b> No long client list to point at yet. That is exactly why the demos and the code are public.</li>
            </ul>
          </Fade>
        </div>
      </div>
    </section>
  );
}
