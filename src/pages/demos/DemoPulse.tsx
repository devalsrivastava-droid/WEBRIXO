import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Count, DemoBar, DemoFooter, Marquee, Reveal, Rise, Tilt, useFont, usePageBackground } from "./kit";

/* PulseFit — loud, dark, fast. Condensed display type, acid green, hard edges.
   Everything a gym site needs: timetable, membership, trainers, no fluff. */

const FONT = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&family=Inter:wght@400;500;600&display=swap";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMETABLE: Record<string, { t: string; n: string; c: string; who: string }[]> = {
  Mon: [{ t: "06:00", n: "Sunrise HIIT", c: "45 min", who: "Rhea" }, { t: "12:15", n: "Lunch Express", c: "30 min", who: "Sam" }, { t: "18:30", n: "Strength I", c: "60 min", who: "Vikram" }, { t: "20:00", n: "Mobility", c: "45 min", who: "Rhea" }],
  Tue: [{ t: "06:30", n: "Conditioning", c: "50 min", who: "Sam" }, { t: "17:00", n: "Boxing basics", c: "60 min", who: "Ali" }, { t: "19:00", n: "Strength II", c: "60 min", who: "Vikram" }],
  Wed: [{ t: "06:00", n: "Sunrise HIIT", c: "45 min", who: "Rhea" }, { t: "12:15", n: "Lunch Express", c: "30 min", who: "Sam" }, { t: "18:30", n: "Legs", c: "55 min", who: "Vikram" }],
  Thu: [{ t: "06:30", n: "Conditioning", c: "50 min", who: "Sam" }, { t: "17:00", n: "Boxing basics", c: "60 min", who: "Ali" }, { t: "19:30", n: "Mobility", c: "45 min", who: "Rhea" }],
  Fri: [{ t: "06:00", n: "Sunrise HIIT", c: "45 min", who: "Rhea" }, { t: "17:30", n: "Full body", c: "60 min", who: "Vikram" }, { t: "19:00", n: "Open gym", c: "90 min", who: "—" }],
  Sat: [{ t: "08:00", n: "Weekend Grind", c: "75 min", who: "Ali" }, { t: "10:00", n: "Beginners", c: "45 min", who: "Rhea" }, { t: "11:30", n: "Open gym", c: "120 min", who: "—" }],
};

const PLANS = [
  { n: "Drop in", p: "₹400", per: "per class", f: ["Any class, any day", "No commitment", "Mat and gloves included"], best: false },
  { n: "Monthly", p: "₹2,400", per: "per month", f: ["Unlimited classes", "Open gym access", "Pause any month", "Bring a friend once a month"], best: true },
  { n: "Annual", p: "₹24,000", per: "per year", f: ["Everything monthly", "Two months free", "Quarterly check-in", "Kit bag on joining"], best: false },
];

const TRAINERS = [
  { n: "Rhea", s: "HIIT & mobility", y: "8 yrs", c: "#4ade80" },
  { n: "Vikram", s: "Strength", y: "12 yrs", c: "#38bdf8" },
  { n: "Sam", s: "Conditioning", y: "6 yrs", c: "#facc15" },
  { n: "Ali", s: "Boxing", y: "10 yrs", c: "#fb7185" },
];

export default function DemoPulse() {
  usePageMeta({
    title: "PulseFit — Train like you mean it",
    description: "A concept gym site built by WEBRIXO: live timetable, memberships and trainers.",
    path: "/demos/pulse",
  });
  useFont(FONT);
  usePageBackground("#080b09");
  const [day, setDay] = useState("Mon");

  return (
    <div className="d-site pulse" style={{
      ["--bg" as string]: "#080b09", ["--ink" as string]: "#eef7f0", ["--muted" as string]: "#7d8a80",
      ["--line" as string]: "rgba(238,247,240,.14)", ["--accent" as string]: "#4ade80", ["--accent-ink" as string]: "#04140a",
      ["--panel" as string]: "rgba(238,247,240,.05)", ["--radius" as string]: "10px",
      ["--display" as string]: "'Archivo', system-ui, sans-serif", ["--body" as string]: "'Inter', system-ui, sans-serif",
    }}>
      <DemoBar label="Gym" />

      <nav className="d-nav">
        <span className="d-nav__brand">PULSEFIT</span>
        <div className="d-nav__links"><a href="#classes">Classes</a><a href="#membership">Membership</a><a href="#trainers">Trainers</a></div>
        <a href="#membership" className="d-nav__cta">Join today</a>
      </nav>

      <header className="d-wrap pulse-hero">
        <Rise as="h1" text="Train like you mean it." className="d-display pulse-hero__h" />
        <Reveal delay={380}>
          <p className="d-lead">Classes every hour from six in the morning. No contracts, no joining fee, no one watching you in the mirror.</p>
          <div className="pulse-hero__cta">
            <a href="#membership" className="d-btn">Start free week</a>
            <a href="#classes" className="d-btn d-btn--ghost">See timetable</a>
          </div>
        </Reveal>
        <Reveal delay={520} className="pulse-stats">
          {[["Classes a week", 42, ""], ["Members", 380, "+"], ["Opens at", 6, "am"]].map(([l, v, s]) => (
            <div key={String(l)} className="pulse-stat">
              <span className="pulse-stat__n"><Count to={v as number} suffix={s as string} /></span>
              <span className="d-small">{l as string}</span>
            </div>
          ))}
        </Reveal>
      </header>

      <Marquee items={["HIIT", "Strength", "Boxing", "Mobility", "Conditioning", "Open gym"]} speed={26} className="pulse-marquee" />

      {/* Timetable */}
      <section id="classes" className="d-section d-wrap">
        <Rise text="This week" className="d-h2" />
        <Reveal delay={140}>
          <div className="pulse-days" role="tablist" aria-label="Choose a day">
            {DAYS.map(d => (
              <button key={d} role="tab" aria-selected={day === d} className={`pulse-day ${day === d ? "is-on" : ""}`} onClick={() => setDay(d)}>{d}</button>
            ))}
          </div>
        </Reveal>
        <div className="pulse-table" key={day}>
          {TIMETABLE[day].map((c, i) => (
            <Reveal as="div" key={c.t + c.n} delay={i * 70}>
              <div className="pulse-class">
                <span className="pulse-class__t">{c.t}</span>
                <span className="pulse-class__n">{c.n}</span>
                <span className="d-small">{c.c}</span>
                <span className="d-small">{c.who}</span>
                <button className="pulse-class__book">Book</button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="d-section pulse-plans">
        <div className="d-wrap">
          <Rise text="Pick a way in" className="d-h2" />
          <Reveal delay={140}><p className="d-body">Everything can be cancelled from your phone. We won't make you email us.</p></Reveal>
          <div className="d-grid d-3 pulse-plans__grid">
            {PLANS.map((p, i) => (
              <Reveal key={p.n} delay={i * 110}>
                <Tilt className={`pulse-plan ${p.best ? "is-best" : ""}`}>
                  {p.best && <span className="pulse-plan__flag">Most popular</span>}
                  <h3 className="d-h3">{p.n}</h3>
                  <div className="pulse-plan__price">{p.p}<span>{p.per}</span></div>
                  <ul className="pulse-plan__list">{p.f.map(f => <li key={f}>{f}</li>)}</ul>
                  <a href="#membership" className={`d-btn ${p.best ? "" : "d-btn--ghost"}`}>Choose {p.n}</a>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section id="trainers" className="d-section d-wrap">
        <Rise text="Who's on the floor" className="d-h2" />
        <div className="pulse-trainers">
          {TRAINERS.map((t, i) => (
            <Reveal key={t.n} delay={i * 90}>
              <article className="pulse-trainer" style={{ ["--c" as string]: t.c }}>
                <div className="pulse-trainer__art"><span>{t.n[0]}</span></div>
                <h3 className="d-h3">{t.n}</h3>
                <p className="d-small">{t.s}</p>
                <p className="pulse-trainer__y">{t.y}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <DemoFooter name="PulseFit" line="Your gym could fill classes like this." />
    </div>
  );
}
