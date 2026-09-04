import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

/* Taskly — demo SaaS landing page. Clean, modern, product-focused. */

const C = { bg: "#fbfbfd", fg: "#101828", muted: "#667085", line: "#eaecf0", accent: "#5b5bd6", accentSoft: "#eef0ff", ink: "#0b0b1a" };
const FONT = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

const FEATURES = [
  { n: "Boards & lists", d: "Organize work the way your brain actually works." },
  { n: "Deadlines that nag", d: "Gentle reminders before things slip, not after." },
  { n: "Team views", d: "See who's doing what, without asking around." },
  { n: "Offline-first", d: "Keep working on the plane. Syncs when you land." },
];

const PRICING = [
  { n: "Starter", p: "$0", per: "forever", f: ["Up to 5 projects", "Unlimited tasks", "2 teammates"] },
  { n: "Pro", p: "$8", per: "per user / month", f: ["Unlimited projects", "Automations", "Priority support"], hot: true },
  { n: "Enterprise", p: "Custom", per: "tailored", f: ["SSO & SAML", "Audit logs", "Dedicated manager"] },
];

export default function DemoTaskly() {
  usePageMeta({
    title: "Taskly — The to-do list your team will use | Demo",
    description: "A demo SaaS landing page built by WEBRIXO. Simple pricing, offline-first, and a CTA that works.",
    path: "/demos/taskly",
  });
  useEffect(() => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT; document.head.appendChild(l); }, []);
  useEffect(() => { document.body.style.background = C.bg; return () => { document.body.style.background = ""; }; }, []);

  const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Inter',sans-serif" }}>
      {/* Demo bar */}
      <div style={{ position: "fixed", top: 0, insetInline: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "rgba(251,251,253,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: ".03em", textTransform: "uppercase", color: C.fg, textDecoration: "none" }}>← Back to WEBRIXO</Link>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, border: `1px solid ${C.line}`, borderRadius: "9999px", padding: "0.25rem 0.75rem" }}>Demo — SaaS</span>
      </div>

      {/* Nav */}
      <header style={{ padding: "4.5rem 1.5rem 1rem", maxWidth: "72rem", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-.02em" }}>taskly<span style={{ color: C.accent }}>.</span></span>
          <nav style={{ display: "flex", gap: "2rem", fontSize: "0.875rem", fontWeight: 500, color: C.muted }}>
            <a href="#features" style={{ textDecoration: "none", color: "inherit" }}>Features</a>
            <a href="#pricing" style={{ textDecoration: "none", color: "inherit" }}>Pricing</a>
            <a href="#cta" style={{ textDecoration: "none", color: "inherit" }}>Sign up</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "4rem 1.5rem 5rem", maxWidth: "72rem", margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600, color: C.accent, background: C.accentSoft, border: "1px solid rgba(91,91,214,.2)", borderRadius: "9999px", padding: "0.4rem 1rem" }}>New · Offline mode is here</span>
          <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.05, margin: "1.5rem auto 1.25rem", maxWidth: "16ch" }}>The to-do list your team will actually use.</h1>
          <p style={{ fontSize: "1.1rem", color: C.muted, maxWidth: "44ch", margin: "0 auto", lineHeight: 1.6 }}>Simple enough for a solo freelancer, powerful enough for a team of fifty. Set up in under a minute.</p>
          <div style={{ marginTop: "2.25rem", display: "flex", flexWrap: "wrap", gap: "0.875rem", justifyContent: "center" }}>
            <a href="#cta" style={{ background: C.accent, color: "#fff", borderRadius: "0.75rem", padding: "0.9rem 1.75rem", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 24px rgba(91,91,214,.25)" }}>Start for free</a>
            <a href="#features" style={{ background: "#fff", color: C.fg, border: `1px solid ${C.line}`, borderRadius: "0.75rem", padding: "0.9rem 1.75rem", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>See how it works</a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "4rem 1.5rem", background: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2 {...fade} style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-.02em", marginBottom: "2.5rem", maxWidth: "18ch" }}>Everything you need. Nothing you don't.</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.n} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }} whileHover={{ y: -4 }} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: "1rem", padding: "1.5rem" }}>
                <span style={{ display: "inline-grid", placeItems: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: C.accentSoft, color: C.accent, fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.875rem" }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{f.n}</h3>
                <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: C.muted, lineHeight: 1.6 }}>{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <motion.h2 {...fade} style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-.02em", textAlign: "center", marginBottom: "2.5rem" }}>Simple pricing</motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {PRICING.map((p, i) => (
              <motion.div key={p.n} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }} whileHover={{ y: -6 }} style={{ position: "relative", background: p.hot ? C.ink : "#fff", color: p.hot ? "#fff" : C.fg, border: p.hot ? "none" : `1px solid ${C.line}`, borderRadius: "1.25rem", padding: "2rem" }}>
                {p.hot && <span style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", background: C.accent, color: "#fff", borderRadius: "9999px", padding: "0.3rem 0.75rem" }}>Popular</span>}
                <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{p.n}</h3>
                <div style={{ margin: "0.75rem 0 1.25rem" }}><span style={{ fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-.02em" }}>{p.p}</span><span style={{ fontSize: "0.875rem", color: p.hot ? "rgba(255,255,255,.6)" : C.muted }}> {p.per}</span></div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>{p.f.map(f => <li key={f} style={{ display: "flex", gap: "0.5rem" }}><span style={{ color: p.hot ? C.accent : C.accent }}>✓</span>{f}</li>)}</ul>
                <a href="#cta" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", background: p.hot ? C.accent : C.ink, color: "#fff", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>Get started</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{ padding: "0 1.5rem 5rem" }}>
        <motion.div {...fade} style={{ maxWidth: "72rem", margin: "0 auto", background: "linear-gradient(135deg, #5b5bd6 0%, #7b6cf0 100%)", borderRadius: "2rem", padding: "4.5rem 2rem", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)", fontWeight: 800, letterSpacing: "-.02em" }}>Get your team on taskly.</h2>
          <p style={{ margin: "1rem auto 2rem", maxWidth: "40ch", color: "rgba(255,255,255,.85)", fontSize: "1rem" }}>Free for your first 14 days. No credit card, no sales call, no awkward silence.</p>
          <a href="#" style={{ display: "inline-flex", background: "#fff", color: C.accent, borderRadius: "0.75rem", padding: "0.9rem 2rem", fontSize: "0.95rem", fontWeight: 700, textDecoration: "none" }}>Start free trial</a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-.02em" }}>taskly<span style={{ color: C.accent }}>.</span></span>
          <span style={{ fontSize: "0.8rem", color: C.muted }}>© 2026 Taskly — A WEBRIXO demo site</span>
        </div>
      </footer>
    </div>
  );
}