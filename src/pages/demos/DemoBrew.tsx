import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

/* Brew & Co. — demo coffee shop site. Warm, editorial, slow-paced. */

const C = { bg: "#f6efe4", ink: "#2a2118", muted: "#8a7a66", line: "#e5dac8", accent: "#c8873f", cream: "#fbf6ec", deep: "#1f1810" };
const FONT = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@400;500;600&display=swap";

function Reveal({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: delay / 1000, ease: [0.215, 0.61, 0.355, 1] }}>{children}</motion.div>;
}

const MENU = [
  { n: "Espresso", d: "Double shot, single origin", p: "3.50" },
  { n: "Flat White", d: "Velvety microfoam, house blend", p: "4.50" },
  { n: "Pour Over", d: "Rotating single origin, brewed slow", p: "5.00" },
  { n: "Cold Brew", d: "18-hour steep, served over ice", p: "4.75" },
  { n: "Matcha Latte", d: "Ceremonial grade, oat milk", p: "5.25" },
  { n: "Cortado", d: "Equal parts espresso + steamed milk", p: "4.00" },
];

export default function DemoBrew() {
  usePageMeta({
    title: "Brew & Co. — Coffee, made slowly",
    description: "A demo coffee shop website built by WEBRIXO. Small-batch roasts, real menus, and a corner window with afternoon sun.",
    path: "/demos/brew",
  });
  const [t, setT] = useState(0);
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT; document.head.appendChild(l); }, []);
  useEffect(() => { document.body.style.background = C.bg; return () => { document.body.style.background = ""; }; }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Outfit',sans-serif" }}>
      {/* Demo bar */}
      <div style={{ position: "fixed", top: 0, insetInline: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "rgba(246,239,230,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase", color: C.ink, textDecoration: "none" }}>← Back to WEBRIXO</Link>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "0.25rem 0.75rem" }}>Demo — Coffee Shop</span>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "6rem 1.5rem 4rem", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 80% 0%, rgba(200,135,63,.18) 0%, transparent 55%), linear-gradient(180deg, #f1e7d6 0%, #f6efe6 100%)" }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }} style={{ position: "relative", maxWidth: "72rem", margin: "0 auto", width: "100%" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.accent, marginBottom: "1.5rem" }}><span style={{ width: "2rem", height: "1px", background: C.accent }} />Est. 2016</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(3rem, 9vw, 6.5rem)", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-.02em", maxWidth: "12ch" }}>Coffee,<br /><em style={{ color: C.accent }}>made slowly.</em></h1>
          <p style={{ marginTop: "1.75rem", maxWidth: "34ch", fontSize: "1.05rem", lineHeight: 1.6, color: C.muted }}>Small-batch roasts, baked goods from scratch, and a corner window that gets the afternoon sun.</p>
          <div style={{ marginTop: "2.5rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <a href="#menu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.deep, color: C.cream, border: "none", borderRadius: "9999px", padding: "1rem 2rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>See the menu →</a>
            <a href="#visit" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: C.ink, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "1rem 2rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>Find the shop</a>
          </div>
        </motion.div>
      </section>

      {/* Menu */}
      <section id="menu" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <Reveal><span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.accent }}>The menu</span></Reveal>
          <Reveal delay={80}><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 400, marginTop: "0.75rem", marginBottom: "3rem" }}>Drinks we actually<br />enjoy making.</h2></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {MENU.map((m, i) => (
              <Reveal key={m.n} delay={i * 60}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: "1.25rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", fontWeight: 600 }}>{m.n}</h3>
                    <span style={{ color: C.accent, fontWeight: 600, fontSize: "0.95rem" }}>${m.p}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: C.muted }}>{m.d}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={{ background: C.deep, color: C.cream, padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          <Reveal><span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.accent }}>Our story</span></Reveal>
          <Reveal delay={80}><p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", lineHeight: 1.35, maxWidth: "24ch" }}>Two friends, one secondhand roaster, and a lot of trial and error.</p></Reveal>
          <Reveal delay={160}><p style={{ maxWidth: "52ch", lineHeight: 1.7, color: "rgba(251,246,236,.65)", fontSize: "0.95rem" }}>We started roasting in a garage in 2016. Today the beans travel two blocks from the roastery to the counter — the shortest supply chain in the city, and the freshest cup we know how to pour.</p></Reveal>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          <Reveal><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400 }}>Come say hi.</h2></Reveal>
          <Reveal delay={80}><div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.95rem" }}>
            <div><p style={{ fontWeight: 600 }}>Hours</p><p style={{ color: C.muted }}>Mon–Fri · 7am–6pm<br />Sat–Sun · 8am–5pm</p></div>
            <div><p style={{ fontWeight: 600 }}>Find us</p><p style={{ color: C.muted }}>14 Willow Street, corner of 3rd Ave</p></div>
            <div><p style={{ fontWeight: 600 }}>Say hi</p><p style={{ color: C.muted }}>hello@brewandco.com</p></div>
          </div></Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", fontWeight: 600 }}>Brew &amp; Co.</span>
          <span style={{ fontSize: "0.8rem", color: C.muted }}>© 2026 Brew &amp; Co. — A WEBRIXO demo site</span>
        </div>
      </footer>
    </div>
  );
}