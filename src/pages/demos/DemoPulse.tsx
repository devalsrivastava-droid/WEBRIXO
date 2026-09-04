import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

/* PulseFit — demo gym site. Bold, dark, loud. */

const C = { bg: "#0c0c0c", panel: "#141414", fg: "#f4f4f2", muted: "#8f8f8a", line: "#262626", accent: "#c8ff3d" };
const FONT = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap";

const CLASSES = [
  { n: "Strength Lab", t: "60 min", d: "Heavy compounds, coached form, zero ego." },
  { n: "HIIT 45", t: "45 min", d: "Short, brutal, over before you know it." },
  { n: "Mobility", t: "30 min", d: "Move better so you can lift heavier." },
  { n: "Open Gym", t: "All day", d: "Train on your own schedule. Coaches on the floor." },
];

const PRICING = [
  { n: "Drop-in", p: "$15", per: "/ session", f: ["Full facility access", "Locker + towel", "No commitment"] },
  { n: "Monthly", p: "$79", per: "/ month", f: ["Unlimited classes", "Open gym access", "Free onboarding session"], hot: true },
  { n: "Annual", p: "$690", per: "/ year", f: ["Everything in Monthly", "2 guest passes / month", "T-shirt + shaker"] },
];

export default function DemoPulse() {
  usePageMeta({
    title: "PulseFit — Train Harder | Demo",
    description: "A demo gym website built by WEBRIXO. No-nonsense classes, honest membership pricing, first session free.",
    path: "/demos/pulse",
  });
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT; document.head.appendChild(l); }, []);
  useEffect(() => { document.body.style.background = C.bg; return () => { document.body.style.background = ""; }; }, []);

  const fade = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Space Grotesk',sans-serif", overflow: "hidden" }}>
      {/* Demo bar */}
      <div style={{ position: "fixed", top: 0, insetInline: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "rgba(12,12,12,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase", color: C.fg, textDecoration: "none" }}>← Back to WEBRIXO</Link>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "0.25rem 0.75rem" }}>Demo — Gym</span>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "7rem 1.5rem 4rem" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 70% 20%, rgba(200,255,61,.08) 0%, transparent 60%), linear-gradient(180deg, #0e0e0e, #0a0a0a)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <motion.div initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative", maxWidth: "76rem", margin: "0 auto", width: "100%" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.accent, marginBottom: "1.5rem" }}><span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />Open 24/7 · Downtown</span>
          <h1 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(3.2rem, 11vw, 8rem)", lineHeight: 0.92, letterSpacing: "-.03em", margin: 0 }}>TRAIN<br /><span style={{ color: C.accent, WebkitTextStroke: "0px" }}>HARDER.</span></h1>
          <p style={{ marginTop: "2rem", maxWidth: "38ch", fontSize: "1.05rem", lineHeight: 1.6, color: C.muted }}>A no-nonsense gym with real coaching. No mirrors in the squat rack, no juice bar — just heavy weights and people who show up.</p>
          <div style={{ marginTop: "2.5rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.accent, color: C.bg, border: "none", borderRadius: "0.5rem", padding: "1rem 2rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", textDecoration: "none", cursor: "pointer" }}>Start training →</a>
            <a href="#classes" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent", color: C.fg, border: `1px solid ${C.line}`, borderRadius: "0.5rem", padding: "1rem 2rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", textDecoration: "none", cursor: "pointer" }}>View classes</a>
          </div>
        </motion.div>
      </section>

      {/* Classes */}
      <section id="classes" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "76rem", margin: "0 auto" }}>
          <motion.div {...fade}><span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.accent }}>Classes</span></motion.div>
          <motion.h2 {...fade} transition={{ ...fade.transition, delay: 0.05 }} style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-.02em", marginTop: "0.75rem", marginBottom: "3rem" }}>Pick your poison.</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {CLASSES.map((c, i) => (
              <motion.div key={c.n} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }} whileHover={{ x: 8 }} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", background: C.panel, border: `1px solid ${C.line}`, borderRadius: "0.75rem", padding: "1.5rem" }}>
                <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: C.accent }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1, minWidth: "12rem" }}><h3 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: "1.25rem", textTransform: "uppercase" }}>{c.n}</h3><p style={{ fontSize: "0.875rem", color: C.muted, marginTop: "0.25rem" }}>{c.d}</p></div>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: C.muted, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "0.375rem 0.875rem" }}>{c.t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "5rem 1.5rem", background: C.panel, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "76rem", margin: "0 auto" }}>
          <motion.div {...fade}><span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.accent }}>Membership</span></motion.div>
          <motion.h2 {...fade} transition={{ ...fade.transition, delay: 0.05 }} style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-.02em", marginTop: "0.75rem", marginBottom: "3rem" }}>No contracts. No fine print.</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {PRICING.map((p, i) => (
              <motion.div key={p.n} {...fade} transition={{ ...fade.transition, delay: i * 0.07 }} whileHover={{ y: -6 }} style={{ position: "relative", background: p.hot ? C.accent : C.bg, color: p.hot ? C.bg : C.fg, border: p.hot ? "none" : `1px solid ${C.line}`, borderRadius: "1rem", padding: "2rem" }}>
                {p.hot && <span style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", background: C.bg, color: C.accent, borderRadius: "9999px", padding: "0.3rem 0.75rem" }}>Most popular</span>}
                <h3 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 700, textTransform: "uppercase", fontSize: "1rem" }}>{p.n}</h3>
                <div style={{ margin: "0.75rem 0 1.25rem" }}><span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: "2.75rem" }}>{p.p}</span><span style={{ fontSize: "0.875rem", opacity: 0.7 }}> {p.per}</span></div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>{p.f.map(f => <li key={f} style={{ display: "flex", gap: "0.5rem" }}><span style={{ color: p.hot ? C.bg : C.accent }}>✓</span>{f}</li>)}</ul>
                <a href="#join" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", background: p.hot ? C.bg : C.accent, color: p.hot ? C.accent : C.bg, borderRadius: "0.5rem", padding: "0.875rem 1rem", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", textDecoration: "none" }}>Join now</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section id="join" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <motion.div {...fade} style={{ maxWidth: "60rem", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", letterSpacing: "-.02em", lineHeight: 1 }}>First session is<br />on us.</h2>
          <p style={{ marginTop: "1.25rem", color: C.muted, maxWidth: "40ch", marginInline: "auto", fontSize: "1rem" }}>Come train free for a day. If you don't love it, no hard feelings.</p>
          <a href="#" style={{ display: "inline-flex", marginTop: "2rem", background: C.accent, color: C.bg, borderRadius: "0.5rem", padding: "1rem 2.25rem", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", textDecoration: "none" }}>Book free day</a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "76rem", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontFamily: "'Archivo',sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".02em" }}>PULSE<span style={{ color: C.accent }}>FIT</span></span>
          <span style={{ fontSize: "0.8rem", color: C.muted }}>© 2026 PulseFit — A WEBRIXO demo site</span>
        </div>
      </footer>
    </div>
  );
}