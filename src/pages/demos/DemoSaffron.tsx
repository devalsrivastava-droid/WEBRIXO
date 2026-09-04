import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { DemoBar, DemoFooter, Parallax, Reveal, Rise, useFont, usePageBackground } from "./kit";

/* Saffron — dark, quiet, expensive. Serif display on near-black with gold.
   A restaurant site whose main job is filling tables. */

const FONT = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap";

const COURSES = [
  { c: "First", items: [{ n: "Kokum and green mango", d: "Chilled, sharp, to wake the palate" }, { n: "Beetroot galouti", d: "Smoked, on a saffron crisp" }] },
  { c: "Second", items: [{ n: "Malabar prawn", d: "Curry leaf butter, coconut vinegar" }, { n: "Charred cauliflower", d: "Burnt garlic yoghurt, pickled stem" }] },
  { c: "Third", items: [{ n: "Kashmiri lamb shank", d: "Slow braised, fennel and dried ginger" }, { n: "Kodava mushroom pulao", d: "Aged basmati, wild mushroom, ghee" }] },
  { c: "Last", items: [{ n: "Jaggery and cardamom kulfi", d: "Toasted pistachio, sea salt" }, { n: "Filter coffee custard", d: "With a chicory tuile" }] },
];

const TIMES = ["6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm"];

export default function DemoSaffron() {
  usePageMeta({
    title: "Saffron — A table for the season",
    description: "A concept restaurant site built by WEBRIXO: seasonal menu and reservations.",
    path: "/demos/saffron",
  });
  useFont(FONT);
  usePageBackground("#140c09");
  const [time, setTime] = useState("7:30 pm");
  const [people, setPeople] = useState(2);

  return (
    <div className="d-site saff" style={{
      ["--bg" as string]: "#140c09", ["--ink" as string]: "#f5e9dc", ["--muted" as string]: "#9c8877",
      ["--line" as string]: "rgba(245,233,220,.16)", ["--accent" as string]: "#d9a441", ["--accent-ink" as string]: "#140c09",
      ["--panel" as string]: "rgba(245,233,220,.05)", ["--radius" as string]: "2px",
      ["--display" as string]: "'Cormorant Garamond', Georgia, serif", ["--body" as string]: "'Jost', system-ui, sans-serif",
    }}>
      <DemoBar label="Restaurant" />

      <nav className="d-nav">
        <span className="d-nav__brand">SAFFRON</span>
        <div className="d-nav__links"><a href="#menu">Menu</a><a href="#reserve">Reserve</a><a href="#rooms">The room</a></div>
        <a href="#reserve" className="d-nav__cta">Book a table</a>
      </nav>

      <header className="saff-hero">
        <Parallax amount={-40} className="saff-hero__bg">
          <span className="saff-hero__glow" />
          <span className="saff-hero__glow saff-hero__glow--two" />
        </Parallax>
        <div className="d-wrap saff-hero__inner">
          <p className="d-eyebrow">Five courses · One long evening</p>
          <Rise as="h1" text="A table for the season." className="d-display saff-hero__h" />
          <Reveal delay={420}>
            <p className="d-lead saff-hero__p">
              Modern Indian cooking from a small kitchen in Colaba. The menu changes when the market does,
              which is roughly every six weeks.
            </p>
            <a href="#reserve" className="d-btn saff-hero__cta">Reserve a table</a>
          </Reveal>
        </div>
        <div className="saff-hero__rule" />
      </header>

      {/* Menu */}
      <section id="menu" className="d-section d-wrap">
        <div className="saff-head">
          <Rise text="This season's table" className="d-h2" />
          <Reveal delay={160}>
            <p className="d-body">₹3,200 a person. Wine pairing ₹1,800. We cook one menu each evening, and we'll work around anything you tell us in advance.</p>
          </Reveal>
        </div>
        <div className="saff-menu">
          {COURSES.map((c, i) => (
            <Reveal as="div" key={c.c} delay={i * 90} className="saff-course">
              <h3 className="saff-course__c">{c.c}</h3>
              <div>
                {c.items.map(it => (
                  <div key={it.n} className="saff-dish">
                    <span className="saff-dish__n">{it.n}</span>
                    <span className="d-small">{it.d}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The room */}
      <section id="rooms" className="d-section saff-room">
        <div className="d-wrap d-split">
          <Parallax amount={30}>
            <div className="d-art saff-room__art">
              <div className="d-art__blob" style={{ inset: "8% 30% 44% 8%", background: "radial-gradient(circle, #d9a441, transparent 70%)" }} />
              <div className="d-art__blob" style={{ inset: "44% 8% 10% 34%", background: "radial-gradient(circle, #8c3b1e, transparent 70%)" }} />
              <div className="d-art__ring" />
              <div className="d-art__grain" />
            </div>
          </Parallax>
          <div>
            <Rise text="Twenty-six seats, one seating a night." className="d-h2" />
            <Reveal delay={200}>
              <p className="d-body saff-room__p">
                We don't turn tables. Once you sit down the evening is yours, and the kitchen paces the courses
                to whatever speed you're going at.
              </p>
              <dl className="saff-facts">
                {[["Dinner", "Tuesday to Sunday, from 6:30 pm"], ["Where", "3 Mandlik Road, Colaba, Mumbai"], ["Corkage", "₹800 a bottle, two bottles maximum"]].map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reserve */}
      <section id="reserve" className="d-section d-wrap">
        <div className="saff-res">
          <Rise text="Book a table" className="d-h2" />
          <Reveal delay={140}>
            <p className="d-body">Tables open thirty days ahead. If tonight looks full, leave your number and we'll call when something opens.</p>
          </Reveal>
          <Reveal delay={220} className="saff-res__card">
            <div className="saff-res__field">
              <span className="d-small">People</span>
              <div className="saff-res__pills">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} aria-pressed={people === n} className={people === n ? "is-on" : ""} onClick={() => setPeople(n)}>{n}</button>
                ))}
              </div>
            </div>
            <div className="saff-res__field">
              <span className="d-small">Time</span>
              <div className="saff-res__pills">
                {TIMES.map(t => (
                  <button key={t} aria-pressed={time === t} className={time === t ? "is-on" : ""} onClick={() => setTime(t)}>{t}</button>
                ))}
              </div>
            </div>
            <p className="saff-res__summary">
              A table for <b>{people}</b> at <b>{time}</b>, this Friday.
            </p>
            <a href="#reserve" className="d-btn">Confirm reservation</a>
          </Reveal>
        </div>
      </section>

      <DemoFooter name="Saffron" line="Your restaurant could fill its tables like this." />
    </div>
  );
}
