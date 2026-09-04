import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Count, DemoBar, DemoFooter, Marquee, Reveal, Rise, Tilt, useFont, usePageBackground } from "./kit";

/* Taskly — a product landing page. Cool indigo, tight grid, a live-ish app
   mock that ticks itself off. The kind of page a small SaaS actually needs. */

const FONT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;800&display=swap";

const TASKS = [
  { t: "Send Q3 numbers to Priya", tag: "Today", done: false },
  { t: "Book the venue deposit", tag: "Today", done: false },
  { t: "Reply to the supplier", tag: "Tomorrow", done: false },
  { t: "Draft the newsletter", tag: "This week", done: false },
  { t: "Renew the domain", tag: "This week", done: false },
];

const FEATURES = [
  { n: "Capture in a second", d: "Type it and move on. Taskly works out the date, the list and the priority from the way you wrote it.", c: "#6d6dff" },
  { n: "Plans that survive contact", d: "Drag anything you didn't finish into tomorrow with one key. No guilt, no red badges.", c: "#22d3ee" },
  { n: "Works offline", d: "On a train, on a plane, in a basement. It syncs when you surface.", c: "#a78bfa" },
  { n: "Shared without the noise", d: "Share one list with one person. Nobody gets a workspace invite they didn't ask for.", c: "#34d399" },
];

export default function DemoTaskly() {
  usePageMeta({
    title: "Taskly — Your day, in order",
    description: "A concept product site built by WEBRIXO for a to-do app: one promise, three screens, one sign-up.",
    path: "/demos/taskly",
  });
  useFont(FONT);
  usePageBackground("#0b0b14");
  const [checked, setChecked] = useState<number[]>([]);
  const [annual, setAnnual] = useState(true);

  // The mock ticks itself off, then resets — it should feel alive, not static.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i > TASKS.length) { i = 0; setChecked([]); }
      else setChecked(prev => [...prev, i - 1]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="d-site task" style={{
      ["--bg" as string]: "#0b0b14", ["--ink" as string]: "#eeeef8", ["--muted" as string]: "#8b8ba7",
      ["--line" as string]: "rgba(238,238,248,.12)", ["--accent" as string]: "#6d6dff", ["--accent-ink" as string]: "#ffffff",
      ["--panel" as string]: "rgba(238,238,248,.05)", ["--radius" as string]: "14px",
      ["--display" as string]: "'Plus Jakarta Sans', system-ui, sans-serif", ["--body" as string]: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <DemoBar label="Software" />

      <nav className="d-nav">
        <span className="d-nav__brand">Taskly</span>
        <div className="d-nav__links"><a href="#features">Product</a><a href="#pricing">Pricing</a><a href="#faq">Docs</a></div>
        <a href="#pricing" className="d-nav__cta">Start free</a>
      </nav>

      <header className="d-wrap task-hero">
        <div>
          <Reveal><span className="task-pill">New · Offline sync</span></Reveal>
          <Rise as="h1" text="Your day, in order." className="d-display" delay={80} />
          <Reveal delay={420}>
            <p className="d-lead">Capture a task in a second. Plan the day in a minute. Taskly is a to-do app that doesn't ask you to run a project.</p>
            <div className="task-hero__cta">
              <a href="#pricing" className="d-btn">Start free</a>
              <a href="#features" className="d-btn d-btn--ghost">See how it works</a>
            </div>
            <p className="d-small task-hero__note">Free for one list, forever. No card.</p>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <Tilt className="task-app" max={5}>
            <div className="task-app__bar"><span /><span /><span /><em>Today · 5 tasks</em></div>
            <ul className="task-app__list">
              {TASKS.map((t, i) => (
                <li key={t.t} className={checked.includes(i) ? "is-done" : ""}>
                  <span className="task-app__box" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9 17.5 20 6.5" /></svg>
                  </span>
                  <span className="task-app__t">{t.t}</span>
                  <span className="task-app__tag">{t.tag}</span>
                </li>
              ))}
            </ul>
            <div className="task-app__foot"><span className="task-app__input">Add a task…</span><span className="task-app__key">⏎</span></div>
          </Tilt>
        </Reveal>
      </header>

      <Marquee items={["Capture", "Plan", "Do", "Offline", "Shared lists", "One keystroke"]} speed={30} />

      <section className="d-section d-wrap task-stats">
        {[["Average capture", 1.2, "s", 1], ["Daily actives", 24, "k", 0], ["Sync conflicts", 0, "", 0]].map(([l, v, s, d]) => (
          <Reveal key={String(l)} className="task-stat">
            <span className="task-stat__n"><Count to={v as number} suffix={s as string} decimals={d as number} /></span>
            <span className="d-small">{l as string}</span>
          </Reveal>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="d-section d-wrap">
        <Rise text="Small app, few opinions, held firmly." className="d-h2 task-featTitle" />
        <div className="d-grid d-2 task-feats">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={i * 100}>
              <Tilt className="task-feat" max={4}>
                <span className="task-feat__dot" style={{ background: f.c }} />
                <h3 className="d-h3">{f.n}</h3>
                <p className="d-body">{f.d}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="d-section task-pricing">
        <div className="d-wrap">
          <Rise text="Two plans. That's the whole page." className="d-h2" />
          <Reveal delay={140} className="task-toggle">
            <button aria-pressed={!annual} className={!annual ? "is-on" : ""} onClick={() => setAnnual(false)}>Monthly</button>
            <button aria-pressed={annual} className={annual ? "is-on" : ""} onClick={() => setAnnual(true)}>Yearly · save 20%</button>
          </Reveal>
          <div className="d-grid d-2 task-plans">
            <Reveal>
              <div className="task-plan">
                <h3 className="d-h3">Free</h3>
                <div className="task-plan__p">₹0</div>
                <ul>{["One list", "Unlimited tasks", "Offline on one device"].map(x => <li key={x}>{x}</li>)}</ul>
                <a href="#pricing" className="d-btn d-btn--ghost">Get started</a>
              </div>
            </Reveal>
            <Reveal delay={110}>
              <div className="task-plan is-best">
                <h3 className="d-h3">Pro</h3>
                <div className="task-plan__p">{annual ? "₹160" : "₹200"}<span>/month</span></div>
                <ul>{["Unlimited lists", "Shared lists", "Offline everywhere", "Sync across devices", "Email support that replies"].map(x => <li key={x}>{x}</li>)}</ul>
                <a href="#pricing" className="d-btn">Start 14-day trial</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <DemoFooter name="Taskly" line="Your product could launch like this." />
    </div>
  );
}
