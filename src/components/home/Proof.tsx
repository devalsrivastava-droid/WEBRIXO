import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { convert, isHomeMarket } from "@/lib/region";
import { Checkout, CurrencySwitcher, useCurrency, type PlanKey } from "./Checkout";
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
  { to: 0.9, suffix: "s", decimals: 1, label: "Typical load time on a phone", note: "Most small-business sites take four times longer." },
  { to: 4, suffix: " weeks", label: "From first call to launch", note: "Two weeks if your content is ready." },
  { to: 100, suffix: "%", label: "Sites we hand over, in your name", note: "Hosting and domain stay yours." },
  { to: 2, label: "People you'll ever talk to", note: "The same two who build it." },
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

/* ── Words from clients: one quote at a time, swapped by scroll ── */
const QUOTES = [
  { text: "We went from a page nobody could find to twenty bookings a week. The site does the explaining so I don't have to.", who: "Meera R.", role: "Owner, yoga studio", accent: "var(--wx-copper)" },
  { text: "They asked better questions than the agency we paid four times as much. Then they finished in a month.", who: "Daniel K.", role: "Founder, software company", accent: "var(--wx-signal)" },
  { text: "I can change the menu myself in two minutes. That alone was worth it.", who: "Arjun S.", role: "Chef and owner, restaurant", accent: "#d9a441" },
  { text: "Our old site took nine seconds to load on a phone. This one opens before you notice.", who: "Priya N.", role: "Manager, dental clinic", accent: "#4ade80" },
];

export function Quotes() {
  const section = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const s = section.current;
    if (!s || prefersReducedMotion()) return;
    const st = ScrollTrigger.create({
      trigger: s, start: "top top", end: "bottom bottom", pin: ".wx-quotes__sticky", scrub: false,
      onUpdate: self => setI(Math.min(QUOTES.length - 1, Math.floor(self.progress * QUOTES.length * 0.999))),
    });
    return () => st.kill();
  }, []);
  const q = QUOTES[i];
  return (
    <section ref={section} id="clients" className="wx-quotes" aria-labelledby="quotes-title">
      <h2 id="quotes-title" className="wx-sr">What clients say</h2>
      <div className="wx-quotes__sticky">
        <div className="wx-container wx-quotes__inner" style={{ ["--q-accent" as string]: q.accent }}>
          <div className="wx-quotes__mark" aria-hidden="true">“</div>
          <blockquote key={i} className="wx-quotes__text">{q.text}</blockquote>
          <figcaption className="wx-quotes__who">
            <b>{q.who}</b>
            <span>{q.role}</span>
          </figcaption>
          <div className="wx-quotes__dots" aria-hidden="true">
            {QUOTES.map((_, n) => <i key={n} className={n === i ? "is-on" : ""} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The two people ── */
const TEAM = [
  {
    initials: "DS",
    name: "Deval",
    role: "Design and front-end",
    accent: "var(--wx-copper)",
    body: "Draws the pages, writes the CSS, and argues for one less section on every project. Answers email before coffee.",
    does: ["Design", "Front-end", "Motion", "Brand basics"],
    line: ["Based in", "Thane, India"],
  },
  {
    initials: "WX",
    name: "Your project",
    role: "The second seat",
    accent: "var(--wx-signal)",
    body: "Every project gets a second pair of eyes on copy, speed and search before it goes live. Nothing ships that only one of us has seen.",
    does: ["Copy", "Search", "Speed", "Testing"],
    line: ["Reply time", "One business day"],
  },
];

export function Team() {
  return (
    <section id="studio" className="wx-section" aria-labelledby="team-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="team-title" className="wx-h2"><Words text="You already know who is building it." /></h2>
          <Fade as="p" className="wx-body" delay={200}>No account manager, no handover to a team you never met. The people below are the people who reply.</Fade>
        </div>
        <div className="wx-team__grid">
          {TEAM.map((m, i) => (
            <Fade key={m.name} className="wx-member" delay={i * 120} style={{ ["--m-accent" as string]: m.accent }}>
              <div className="wx-member__top">
                <span className="wx-member__avatar" aria-hidden="true">{m.initials}</span>
                <div>
                  <h3>{m.name}</h3>
                  <p className="wx-small">{m.role}</p>
                </div>
              </div>
              <p className="wx-body">{m.body}</p>
              <ul className="wx-member__does">{m.does.map(d => <li key={d}>{d}</li>)}</ul>
              <div className="wx-member__line"><span>{m.line[0]}</span><span>{m.line[1]}</span></div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
