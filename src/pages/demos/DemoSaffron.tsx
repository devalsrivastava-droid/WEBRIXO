import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

/* Saffron — demo restaurant site. Elegant, quiet luxury. */

const C = { bg: "#f7f3ec", ink: "#1d2a24", deep: "#16211c", gold: "#b98a44", muted: "#7d7468", line: "#e4dccd", cream: "#fbf8f2" };
const FONT = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap";

const DISHES = [
  { n: "Charred Leek", d: "burrata · hazelnut · brown butter", p: "18" },
  { n: "Tuna Crudo", d: "citrus · chili oil · herbs", p: "22" },
  { n: "Roast Beets", d: "labneh · dill · pistachio", p: "17" },
  { n: "Lamb Shoulder", d: "saffron jus · pearl onion", p: "38" },
  { n: "Sea Bass", d: "fennel · tomato water · olive", p: "34" },
  { n: "Saffron Panna Cotta", d: "honey · candied orange", p: "12" },
];

const TABS = ["Dinner", "Wine", "Dessert"];

export default function DemoSaffron() {
  usePageMeta({
    title: "Saffron — Seasonal Restaurant | Demo",
    description: "A demo restaurant website built by WEBRIXO. Seasonal plates, wood fire, and a menu that changes with the market.",
    path: "/demos/saffron",
  });
  const [tab, setTab] = useState(0);
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT; document.head.appendChild(l); }, []);
  useEffect(() => { document.body.style.background = C.bg; return () => { document.body.style.background = ""; }; }, []);

  const fade = { initial: { opacity: 0, y: 26 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] } };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Jost',sans-serif" }}>
      {/* Demo bar */}
      <div style={{ position: "fixed", top: 0, insetInline: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "rgba(247,243,236,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 500, letterSpacing: ".03em", textTransform: "uppercase", color: C.ink, textDecoration: "none" }}>← Back to WEBRIXO</Link>
        <span style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "0.25rem 0.75rem" }}>Demo — Restaurant</span>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "7rem 1.5rem 4rem", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 80% at 50% 0%, rgba(185,138,68,.14) 0%, transparent 60%), linear-gradient(180deg, #f3ede2 0%, #f7f3ec 100%)" }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.215, 0.61, 0.355, 1] }} style={{ position: "relative" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 400, letterSpacing: ".4em", textTransform: "uppercase", color: C.gold }}>Est. 2019 · Dinner nightly</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(3.5rem, 11vw, 7.5rem)", lineHeight: 1, letterSpacing: "-.01em", margin: "1.5rem 0 2rem" }}>Saffron</h1>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: C.muted, maxWidth: "34ch", margin: "0 auto" }}>Seasonal plates, wood fire, and wine that pairs itself.</p>
          <div style={{ marginTop: "2.75rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <a href="#reserve" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.deep, color: C.cream, border: "none", borderRadius: "9999px", padding: "1rem 2.25rem", fontSize: "0.85rem", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", cursor: "pointer" }}>Reserve a table</a>
            <a href="#menu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: C.ink, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "1rem 2.25rem", fontSize: "0.85rem", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none", cursor: "pointer" }}>View menu</a>
          </div>
        </motion.div>
      </section>

      {/* Menu */}
      <section id="menu" style={{ background: C.deep, color: C.cream, padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fade}><span style={{ fontSize: "0.8rem", fontWeight: 400, letterSpacing: ".4em", textTransform: "uppercase", color: C.gold }}>The menu</span></motion.div>
          <motion.h2 {...fade} transition={{ ...fade.transition, delay: 0.05 }} style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(2.2rem, 5vw, 3.5rem)", margin: "1rem 0 2.5rem" }}>Tonight's table</motion.h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem" }}>
            {TABS.map((t, i) => <button key={t} onClick={() => setTab(i)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 400, letterSpacing: ".15em", textTransform: "uppercase", color: i === tab ? C.gold : "rgba(251,248,242,.5)", borderBottom: i === tab ? `1px solid ${C.gold}` : "1px solid transparent", padding: "0.5rem 1rem", transition: "color .3s" }}>{t}</button>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", textAlign: "left" }}>
            {DISHES.slice(tab * 3, tab * 3 + 3).map((d, i) => (
              <motion.div key={d.n} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} style={{ display: "flex", alignItems: "baseline", gap: "1rem", borderBottom: "1px solid rgba(251,248,242,.12)", paddingBottom: "1rem" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "1.4rem" }}>{d.n}</h3>
                <span style={{ flex: 1, borderBottom: "1px dotted rgba(251,248,242,.25)", transform: "translateY(-0.25rem)" }} />
                <p style={{ color: "rgba(251,248,242,.6)", fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem" }}>{d.d}</p>
                <span style={{ color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem" }}>{d.p}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          <motion.div {...fade}><span style={{ fontSize: "0.8rem", fontWeight: 400, letterSpacing: ".4em", textTransform: "uppercase", color: C.gold }}>The house</span></motion.div>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.06 }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", lineHeight: 1.4, maxWidth: "26ch" }}>A small dining room with a big fire. Everything else follows the seasons.</p>
            <p style={{ marginTop: "1.5rem", maxWidth: "52ch", lineHeight: 1.8, color: C.muted, fontSize: "0.95rem" }}>We cook over wood, buy from farms we can name, and change the menu when the market tells us to. The wine list is short, natural, and chosen to go with what's on the fire tonight.</p>
          </motion.div>
        </div>
      </section>

      {/* Reserve */}
      <section id="reserve" style={{ background: C.cream, borderTop: `1px solid ${C.line}`, padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fade}><span style={{ fontSize: "0.8rem", fontWeight: 400, letterSpacing: ".4em", textTransform: "uppercase", color: C.gold }}>Reservations</span></motion.div>
          <motion.h2 {...fade} transition={{ ...fade.transition, delay: 0.05 }} style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(2.2rem, 5vw, 3.5rem)", margin: "1rem 0 1.5rem" }}>Join us for dinner.</motion.h2>
          <motion.p {...fade} transition={{ ...fade.transition, delay: 0.1 }} style={{ color: C.muted, maxWidth: "40ch", margin: "0 auto 2.5rem", fontSize: "0.95rem", lineHeight: 1.7 }}>Tuesday to Saturday, from 6pm. Parties up to eight — for larger groups, call us and we'll sort it out.</motion.p>
          <motion.a {...fade} transition={{ ...fade.transition, delay: 0.15 }} href="tel:+15550123456" style={{ display: "inline-flex", background: C.deep, color: C.cream, borderRadius: "9999px", padding: "1rem 2.5rem", fontSize: "0.85rem", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none" }}>+1 (555) 012-3456</motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 500 }}>Saffron</span>
          <span style={{ fontSize: "0.8rem", color: C.muted }}>© 2026 Saffron — A WEBRIXO demo site</span>
        </div>
      </footer>
    </div>
  );
}