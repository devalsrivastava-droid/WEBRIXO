import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

const C = { bg: "#000000", fg: "#f3f1ec", ink: "#f3f1ec", line: "rgba(243,241,236,.14)", accent: "#d4884b", muted: "rgba(139,137,131,1)" };

const SECTIONS = [
  {
    h: "What we collect",
    p: "When you sign in or send us a request, we collect the information you give us: your name, email, country, and anything you write about your project. If you make a purchase, our payment processor handles the card details — we never see or store them.",
  },
  {
    h: "How we use it",
    p: "We use your information to reply to you, build your project, and improve our services. We don't sell your data to anyone. We don't run ads against it. It's yours.",
  },
  {
    h: "Cookies & analytics",
    p: "We use a privacy-friendly analytics script (Simple Analytics) that does not track you across sites and stores no personal data. We use a small cookie banner so you're in control. No creepy ad trackers, ever.",
  },
  {
    h: "Where it lives",
    p: "Your data is stored securely with our hosting providers (Convex and Vercel). We keep it only as long as needed to serve you — delete your account and we delete your data.",
  },
  {
    h: "Your rights",
    p: "You can ask us to see, fix, or delete your personal data at any time. Just email hello@webrixo.com and we'll sort it out within a few days.",
  },
  {
    h: "Changes",
    p: "If we ever change this policy, we'll update this page and note the date below. If it's a big change, we'll email you.",
  },
];

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy | WEBRIXO",
    description: "How WEBRIXO handles your data — plainly. No selling, no ad trackers, no fine print games.",
    path: "/privacy",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Bricolage Grotesque',system-ui,sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", maxWidth: "88rem", margin: "0 auto", width: "100%" }}>
        <Link to="/" style={{ fontSize: "1.125rem", fontWeight: 700, textDecoration: "none", color: C.fg }}>WEB<span style={{ color: C.accent }}>RIXO</span></Link>
        <Link to="/" style={{ fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", color: C.fg, border: "1px solid #e6e5e2", borderRadius: "9999px", padding: "0.5rem 1.25rem" }}>Back home</Link>
      </header>

      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "4rem 1.25rem 6rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "rgba(139,137,131,1)" }}>
          <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", background: C.accent }} /> Privacy Policy
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 600, letterSpacing: "-.02em", margin: "1rem 0 0.5rem" }}>Your data, handled like a human would.</h1>
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