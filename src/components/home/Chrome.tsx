import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { NAV } from "./data";
import { prefersReducedMotion } from "./motion";

const ease = [0.16, 1, 0.3, 1] as const;

/* Brand mark: the four-point spark from the logo, drawn as a stroke */
export function Mark({ className, stroke = false, style }: { className?: string; stroke?: boolean; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="6" stroke="currentColor" strokeWidth="2.5" pathLength={1} className={stroke ? "mark-path" : undefined} />
      <path d="M20 14c1.6 8.6 5 12 13.6 13.6C25 29.2 21.6 32.6 20 41.2 18.4 32.6 15 29.2 6.4 27.6 15 26 18.4 22.6 20 14z" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth="2" pathLength={1} className={stroke ? "mark-path" : undefined} transform="translate(12 6)" />
      <rect x="26" y="38" width="20" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="wx-brand" aria-label="WEBRIXO home">
      <Mark />
      <span>WEBRIXO</span>
    </Link>
  );
}

/* ── Preloader: counter + mark, then the curtain lifts ── */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const [exit, setExit] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) { onDone(); return; }
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setExit(true); setTimeout(onDone, 700); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div className="wx-loader" initial={false} animate={exit ? { y: "-100%" } : { y: 0 }} transition={{ duration: 0.9, ease }} aria-hidden="true">
      <div className="wx-loader__meta"><span>WEBRIXO</span><span>Design and build studio</span></div>
      <motion.div className="wx-loader__mark" initial={{ opacity: 0, scale: 0.9 }} animate={exit ? { opacity: 0, y: -20 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease }}>
        <Mark stroke />
      </motion.div>
      <div>
        <div className="wx-loader__meta" style={{ marginBottom: "0.75rem" }}><span>Loading</span><span className="wx-num">{String(n).padStart(3, "0")}</span></div>
        <div className="wx-loader__bar"><span style={{ transform: `scaleX(${n / 100})`, transition: "transform .12s linear" }} /></div>
      </div>
      <style>{`.mark-path{stroke-dasharray:1;stroke-dashoffset:1;animation:markDraw 1s cubic-bezier(.65,0,.35,1) forwards}.mark-path:nth-child(2){animation-delay:.25s}@keyframes markDraw{to{stroke-dashoffset:0}}`}</style>
    </motion.div>
  );
}

/* ── Header: hides on scroll down, returns on scroll up ── */
export function Header({ onStart, isAuthenticated, onSignOut }: { onStart: () => void; isAuthenticated: boolean; onSignOut: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last && y > 240 && !open);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    const ids = NAV.map(n => n.href.slice(1));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className={`wx-header ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
        <div className="wx-container wx-header__bar">
          <Wordmark />
          <nav className="wx-nav" aria-label="Primary">
            {NAV.map(n => <a key={n.href} href={n.href} aria-current={active === n.href.slice(1) ? "true" : undefined}>{n.label}</a>)}
          </nav>
          <div className="wx-header__actions">
            {isAuthenticated
              ? <><Link to="/account" className="wx-btn wx-btn--ghost wx-btn--sm">Account</Link><button onClick={onSignOut} className="wx-btn wx-btn--ghost wx-btn--sm">Sign out</button></>
              : <Link to="/auth" className="wx-btn wx-btn--ghost wx-btn--sm">Sign in</Link>}
            <button onClick={onStart} className="wx-btn wx-btn--sm" style={{ display: "none" }} data-desktop-cta>Start a project</button>
            <button className="wx-menu-btn" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="wx-menu" aria-label="Open menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 8h16M4 16h16" /></svg>
              Menu
            </button>
          </div>
        </div>
        <style>{`@media (min-width:64rem){[data-desktop-cta]{display:inline-flex!important}}`}</style>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="wx-menu" className="wx-menu" role="dialog" aria-modal="true" aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.7, ease }}>
            <div className="wx-header__bar">
              <Wordmark />
              <button className="wx-menu-btn" onClick={close} aria-label="Close menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                Close
              </button>
            </div>
            <ul className="wx-menu__list">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease }}>
                  <a href={n.href} onClick={close}>{n.label}<small>0{i + 1}</small></a>
                </motion.li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button onClick={() => { close(); setTimeout(onStart, 350); }} className="wx-btn wx-btn--copper">Start a project</button>
              {isAuthenticated
                ? <button onClick={() => { close(); onSignOut(); }} className="wx-btn wx-btn--ghost">Sign out</button>
                : <Link to="/auth" className="wx-btn wx-btn--ghost">Sign in</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
