import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { DemoBar, DemoFooter, Marquee, Parallax, Reveal, Rise, useFont, usePageBackground } from "./kit";

/* Brew & Co. — a slow, editorial coffee site. Serif display, warm paper,
   generous white space. The kind of site you'd want to read on a Sunday. */

const FONT = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap";

const MENU = [
  { n: "Espresso", d: "Double shot, single origin, pulled short", p: "₹180" },
  { n: "Flat white", d: "Velvety microfoam over the house blend", p: "₹240" },
  { n: "Pour over", d: "Rotating origin, brewed slow at the bar", p: "₹280" },
  { n: "Cold brew", d: "Eighteen hours steeped, poured over ice", p: "₹260" },
  { n: "Cortado", d: "Equal parts espresso and steamed milk", p: "₹220" },
  { n: "Filter of the day", d: "Ask whoever is on bar", p: "₹160" },
];

const ROASTS = [
  { name: "Kalledevarapura", origin: "Chikmagalur, India", notes: "Cocoa, plum, brown sugar", roast: "Medium", price: "₹650 / 250g" },
  { name: "Yirgacheffe", origin: "Gedeb, Ethiopia", notes: "Jasmine, bergamot, peach", roast: "Light", price: "₹850 / 250g" },
  { name: "Huila", origin: "Pitalito, Colombia", notes: "Caramel, red apple, almond", roast: "Medium dark", price: "₹720 / 250g" },
];

export default function DemoBrew() {
  usePageMeta({
    title: "Brew & Co. — Coffee, made slowly",
    description: "A concept coffee shop site built by WEBRIXO: menu, roasts, and a corner window with afternoon sun.",
    path: "/demos/brew",
  });
  useFont(FONT);
  usePageBackground("#f6efe4");
  const [roast, setRoast] = useState(0);

  return (
    <div className="d-site" style={{
      ["--bg" as string]: "#f6efe4", ["--ink" as string]: "#241c14", ["--muted" as string]: "#8a7a66",
      ["--line" as string]: "rgba(36,28,20,.14)", ["--accent" as string]: "#b4682a", ["--accent-ink" as string]: "#fdf8f0",
      ["--panel" as string]: "rgba(36,28,20,.05)", ["--radius" as string]: "4px",
      ["--display" as string]: "'Fraunces', Georgia, serif", ["--body" as string]: "'Inter', system-ui, sans-serif",
    }}>
      <DemoBar label="Coffee shop" />

      <nav className="d-nav">
        <span className="d-nav__brand">Brew&nbsp;&amp;&nbsp;Co.</span>
        <div className="d-nav__links">
          <a href="#menu">Menu</a><a href="#roasts">Roasts</a><a href="#story">Our story</a><a href="#visit">Visit</a>
        </div>
        <a href="#visit" className="d-nav__cta">Order beans</a>
      </nav>

      {/* Hero */}
      <header className="d-wrap brew-hero">
        <p className="d-eyebrow brew-hero__eyebrow">Est. 2019 · Bandra West</p>
        <Rise as="h1" text="Coffee, made slowly." className="d-display brew-hero__h" />
        <Reveal delay={420}>
          <p className="d-lead brew-hero__p">
            We roast in small batches on a Tuesday and sell it before Friday. No syrups, no queue system,
            no hurry. Just a corner window that gets the afternoon sun.
          </p>
          <div className="brew-hero__cta">
            <a href="#menu" className="d-btn">See the menu</a>
            <a href="#visit" className="d-btn d-btn--ghost">Find us</a>
          </div>
        </Reveal>

        <Parallax amount={54} className="brew-hero__art">
          <div className="d-art">
            <div className="d-art__blob" style={{ inset: "6% 18% 42% 8%", background: "radial-gradient(circle, #d98b3f, transparent 70%)" }} />
            <div className="d-art__blob" style={{ inset: "40% 6% 8% 30%", background: "radial-gradient(circle, #6b3f22, transparent 70%)" }} />
            <div className="d-art__ring" />
            <div className="d-art__grain" />
            <span className="brew-hero__cup">☕</span>
          </div>
        </Parallax>
      </header>

      <Marquee items={["Small batch", "Roasted Tuesdays", "Single origin", "Filter bar", "No syrups", "Open 7am"]} speed={38} />

      {/* Menu */}
      <section id="menu" className="d-section d-wrap">
        <div className="brew-head">
          <Rise text="On the bar today" className="d-h2" />
          <Reveal delay={160}><p className="d-body">Prices are the same whether you sit in or take away. Oat milk is no extra.</p></Reveal>
        </div>
        <div className="brew-menu">
          {MENU.map((m, i) => (
            <Reveal as="div" key={m.n} delay={i * 60}>
              <div className="d-row">
                <div>
                  <div className="d-row__name">{m.n}</div>
                  <div className="d-small">{m.d}</div>
                </div>
                <div className="d-row__price">{m.p}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Roasts */}
      <section id="roasts" className="d-section brew-roasts">
        <div className="d-wrap">
          <div className="brew-head">
            <Rise text="Three roasts, rotating" className="d-h2" />
            <Reveal delay={160}><p className="d-body">Bags are ground to order. Tell us your brewer and we'll set the grind.</p></Reveal>
          </div>
          <div className="brew-roasts__grid">
            <div className="brew-roasts__list">
              {ROASTS.map((r, i) => (
                <button key={r.name} className={`brew-roast ${roast === i ? "is-on" : ""}`} onClick={() => setRoast(i)}>
                  <span className="brew-roast__n">0{i + 1}</span>
                  <span>
                    <span className="d-h3">{r.name}</span>
                    <span className="d-small">{r.origin}</span>
                  </span>
                </button>
              ))}
            </div>
            <Reveal className="brew-roasts__panel" key={roast}>
              <div className="d-art d-art--wide brew-roasts__art">
                <div className="d-art__blob" style={{ inset: "10% 30% 30% 10%", background: `radial-gradient(circle, ${["#c98a45", "#cbb26a", "#a8623a"][roast]}, transparent 70%)` }} />
                <div className="d-art__blob" style={{ inset: "35% 10% 10% 40%", background: `radial-gradient(circle, ${["#5c3a21", "#7d7a3f", "#6d3a24"][roast]}, transparent 70%)` }} />
                <div className="d-art__grain" />
              </div>
              <dl className="brew-roasts__facts">
                <div><dt>Tastes like</dt><dd>{ROASTS[roast].notes}</dd></div>
                <div><dt>Roast</dt><dd>{ROASTS[roast].roast}</dd></div>
                <div><dt>Bag</dt><dd>{ROASTS[roast].price}</dd></div>
              </dl>
              <a href="#visit" className="d-btn">Order {ROASTS[roast].name.split(" ")[0]}</a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="d-section d-wrap">
        <div className="d-split">
          <Parallax amount={-30}>
            <div className="d-art">
              <div className="d-art__blob" style={{ inset: "12% 12% 38% 12%", background: "radial-gradient(circle, #e0a765, transparent 70%)" }} />
              <div className="d-art__blob" style={{ inset: "45% 20% 10% 18%", background: "radial-gradient(circle, #4d2f1a, transparent 70%)" }} />
              <div className="d-art__ring" />
              <div className="d-art__grain" />
            </div>
          </Parallax>
          <div>
            <Rise text="One room, one roaster, one long counter." className="d-h2" />
            <Reveal delay={200}>
              <p className="d-body brew-story__p">
                We started in a 400 square foot room with a second-hand roaster and a hand grinder. Most of that
                is still true. The counter is long enough for eleven people, and the regulars have opinions about
                where they sit.
              </p>
              <p className="d-body brew-story__p">
                If you want to see the roast, come on a Tuesday morning. Bring a jar and we'll fill it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="d-section brew-visit">
        <div className="d-wrap d-split">
          <div>
            <Rise text="Come and sit down." className="d-h2" />
            <Reveal delay={180}>
              <address className="brew-visit__addr">
                14 Chapel Road, Bandra West<br />Mumbai 400050
              </address>
              <a href="#visit" className="d-btn">Get directions</a>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <dl className="brew-hours">
              {[["Monday", "Closed"], ["Tuesday — Friday", "7:00 — 18:00"], ["Saturday", "8:00 — 19:00"], ["Sunday", "8:00 — 15:00"]].map(([d, h]) => (
                <div key={d}><dt>{d}</dt><dd>{h}</dd></div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <DemoFooter name="Brew & Co." line="Your café could open like this." />
    </div>
  );
}
