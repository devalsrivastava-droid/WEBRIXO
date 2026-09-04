import { motion } from "framer-motion";
import { Link } from "react-router";
import { usePageMeta } from "@/hooks/use-page-meta";

const C = { bg: "#000000", fg: "#f3f1ec", ink: "#f3f1ec", line: "rgba(243,241,236,.14)", accent: "#d4884b" };

export default function NotFound() {
  usePageMeta({
    title: "404 — Page not found | WEBRIXO",
    description: "That page doesn't exist. Let's get you back to something useful.",
    path: "/404",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Bricolage Grotesque',system-ui,sans-serif", display: "flex", flexDirection: "column" }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", maxWidth: "88rem", margin: "0 auto", width: "100%" }}>
        <Link to="/" style={{ fontSize: "1.125rem", fontWeight: 700, textDecoration: "none", color: C.fg }}>WEB<span style={{ color: C.accent }}>RIXO</span></Link>
        <Link to="/" style={{ fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", color: C.fg, border: "1px solid #e6e5e2", borderRadius: "9999px", padding: "0.5rem 1.25rem" }}>Back home</Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.25rem" }}>
        <div style={{ textAlign: "center" }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "rgba(139,137,131,1)", border: "1px solid #e6e5e2", borderRadius: "9999px", padding: "0.375rem 1rem" }}
          >
            <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", background: C.accent }} /> Error 404
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ fontSize: "clamp(4rem, 14vw, 9rem)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1, margin: "1.5rem 0", color: C.ink }}
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "1.125rem", color: "rgba(139,137,131,1)", maxWidth: "36ch", margin: "0 auto" }}
          >
            This page doesn't exist. Maybe it's still in the oven — or maybe you typed the wrong thing.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}
          >
            <Link to="/" style={{ background: C.ink, color: "#000", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none" }}>Take me home</Link>
            <Link to="/demos/brew" style={{ border: "1px solid #e6e5e2", color: C.fg, borderRadius: "9999px", padding: "0.875rem 1.75rem", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none" }}>See a demo</Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}