import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

const C = { bg: "#000000", fg: "#f3f1ec", ink: "#f3f1ec", line: "rgba(243,241,236,.14)", accent: "#d4884b", muted: "rgba(139,137,131,1)" };

const SECTIONS = [
  {
    h: "What you get",
    p: "When you order a project, we deliver what we agreed on in writing: a working website, built to the scope we discussed. If something's in the agreement, it gets done. If it's not, we'll tell you before we do it.",
  },
  {
    h: "Payments",
    p: "We take a deposit to start (usually 50%), and the rest when the work is delivered. If you're not happy with what we build, we'll work with you to make it right — that's non-negotiable on our end.",
  },
  {
    h: "Timelines",
    p: "We give real timelines and stick to them. If we're going to be late, you'll hear from us before the deadline, not after. Delays from your side (content, assets, feedback) push the timeline back fairly.",
  },
  {
    h: "Your content & IP",
    p: "Everything you give us stays yours. Everything we build for you becomes yours once we're paid in full. We may show the work in our portfolio unless you ask us not to.",
  },
  {
    h: "Cancellations",
    p: "You can cancel anytime. You pay for work already done, and we keep things friendly. No lock-in, no hostage situations.",
  },
  {
    h: "Liability",
    p: "We build carefully and test everything we ship, but we're not responsible for issues caused by third-party services you connect, content you change after launch, or things outside our control.",
  },
];

export default function Terms() {
  usePageMeta({
    title: "Terms of Service | WEBRIXO",
    description: "The plain-English terms for working with WEBRIXO. No fine print games.",
    path: "/terms",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Bricolage Grotesque',system-ui,sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", maxWidth: "88rem", margin: "0 auto", width: "100%" }}>
        <Link to="/" style={{ fontSize: "1.125rem", fontWeight: 700, textDecoration: "none", color: C.fg }}>WEB<span style={{ color: C.accent }}>RIXO</span></Link>
        <Link to="/" style={{ fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", color: C.fg, border: "1px solid #e6e5e2", borderRadius: "9999px", padding: "0.5rem 1.25rem" }}>Back home</Link>
      </header>

      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "4rem 1.25rem 6rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "rgba(139,137,131,1)" }}>
          <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", background: C.accent }} /> Terms of Service
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-.02em", margin: "1rem 0 0.5rem" }}>Simple terms, honestly written.</h1>
        <p style={{ fontSize: "0.875rem", color: C.muted, marginBottom: "3rem" }}>Last updated: August 28, 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {SECTIONS.map(s => (
            <section key={s.h}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>{s.h}</h2>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: C.muted }}>{s.p}</p>
            </section>
          ))}
        </div>

        <div style={{ marginTop: "4rem", borderTop: "1px solid #e6e5e2", paddingTop: "2rem", fontSize: "0.875rem", color: C.muted }}>
          Questions? Email <a href="mailto:hello@webrixo.com" style={{ color: C.accent, textDecoration: "none" }}>hello@webrixo.com</a>
        </div>
      </main>
    </div>
  );
}