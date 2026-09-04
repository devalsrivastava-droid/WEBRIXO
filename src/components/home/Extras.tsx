import { useEffect, useRef, useState, useCallback } from "react";
import { Mark } from "./Chrome";
import { NAV } from "./data";
import { Fade, Words, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

/* ── Marquee: drifts on its own, speeds up and skews with scroll velocity ── */
const MARQUEE = ["Design", "Build", "Launch", "Care"];
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const half = el.scrollWidth / 2;
    const drift = gsap.to(el, { x: -half, duration: 28, ease: "none", repeat: -1 });
    const skew = gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" });
    const st = ScrollTrigger.create({
      onUpdate: self => {
        const v = self.getVelocity();
        drift.timeScale(gsap.utils.clamp(1, 4, 1 + Math.abs(v) / 700));
        skew(gsap.utils.clamp(-10, 10, v / 180));
      },
    });
    const settle = () => { if (drift.timeScale() > 1) drift.timeScale(gsap.utils.interpolate(drift.timeScale(), 1, 0.06)); };
    gsap.ticker.add(settle);
    return () => { drift.kill(); st.kill(); gsap.ticker.remove(settle); };
  }, []);
  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE];
  return (
    <div className="wx-marquee" aria-hidden="true">
      <div className="wx-marquee__track" ref={track}>
        {items.map((w, i) => <span key={i} className="wx-marquee__item">{w}<Mark className="wx-marquee__mark" /></span>)}
      </div>
    </div>
  );
}

/* ── What we build: cards that stack and settle as you scroll ── */
const SERVICES = [
  { title: "Marketing sites", body: "Who you are, what you do, how to reach you. Two to eight pages, written and built to turn visitors into customers.", best: "Cafés, clinics, studios, trades", accent: "#d4884b", shape: "bars" },
  { title: "Bookings and ordering", body: "Reservations, class timetables, online orders. Connected to the tools you already use, so nothing is typed twice.", best: "Restaurants, gyms, salons", accent: "#4ade80", shape: "grid" },
  { title: "Product landing pages", body: "One promise, the proof behind it, and a sign-up that works on a phone. Built to be measured and improved.", best: "Software, launches, apps", accent: "#6d6dff", shape: "wave" },
  { title: "Redesigns", body: "Keep what's working, fix what isn't, and move to a site you can edit yourself, without losing your search ranking.", best: "Anyone whose site is five years old", accent: "#d9a441", shape: "split" },
  { title: "Care after launch", body: "A light monthly retainer for updates, new pages, speed and search checks. Or just email us when something comes up.", best: "Everyone we've built for", accent: "#f3f1ec", shape: "ring" },
];

function Shape({ kind, accent }: { kind: string; accent: string }) {
  const a = { ["--s-accent" as string]: accent };
  if (kind === "bars") return <div className="wx-shape wx-shape--bars" style={a}><i /><i /><i /><i /></div>;
  if (kind === "grid") return <div className="wx-shape wx-shape--grid" style={a}>{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>;
  if (kind === "wave") return <div className="wx-shape wx-shape--wave" style={a}><svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M0 70 C 40 20, 80 20, 100 55 S 160 95, 200 30" /></svg></div>;
  if (kind === "split") return <div className="wx-shape wx-shape--split" style={a}><i /><b /></div>;
  return <div className="wx-shape wx-shape--ring" style={a}><i /><i /></div>;
}

export function Services() {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = list.current;
    if (!root || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>(".wx-card", root);
    const tweens = cards.map((card, i) => {
      if (i === cards.length - 1) return null;
      const next = cards[i + 1];
      return gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
        scale: 0.93 - i * 0.008, filter: "brightness(0.5)", ease: "none",
        scrollTrigger: { trigger: next, start: "top 90%", end: "top 14%", scrub: true },
      });
    });
    return () => tweens.forEach(t => { t?.scrollTrigger?.kill(); t?.kill(); });
  }, []);
  return (
    <section id="services" className="wx-section" aria-labelledby="services-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="services-title" className="wx-h2"><Words text="What we build, and who it's for." /></h2>
          <Fade as="p" className="wx-body" delay={200}>Five kinds of work. Each card is a real scope we quote, not a menu of everything.</Fade>
        </div>
        <div className="wx-stack" ref={list}>
          {SERVICES.map((s, i) => (
            <article key={s.title} className="wx-card" style={{ ["--i" as string]: i }}>
              <div className="wx-card__inner">
                <div className="wx-card__text">
                  <span className="wx-card__n wx-num">{String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}</span>
                  <h3 className="wx-h2" style={{ fontSize: "clamp(1.75rem, 3.4vw, 3rem)" }}>{s.title}</h3>
                  <p className="wx-body">{s.body}</p>
                  <dl className="wx-card__best"><dt>Best for</dt><dd>{s.best}</dd></dl>
                </div>
                <Shape kind={s.shape} accent={s.accent} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Before / after: drag the handle across a redesign ── */
export function BeforeAfter() {
  const wrap = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const dragging = useRef(false);
  const setFromEvent = useCallback((clientX: number) => {
    const r = wrap.current?.getBoundingClientRect(); if (!r) return;
    setPos(gsap.utils.clamp(0, 100, ((clientX - r.left) / r.width) * 100));
  }, []);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    if (prefersReducedMotion()) { setPos(50); return; }
    const st = ScrollTrigger.create({ trigger: el, start: "top 75%", once: true, onEnter: () => { const o = { v: 0 }; gsap.to(o, { v: 55, duration: 1.6, ease: "power3.inOut", onUpdate: () => setPos(o.v) }); } });
    return () => st.kill();
  }, []);
  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) setFromEvent(e.clientX); };
    const up = () => { dragging.current = false; };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [setFromEvent]);

  return (
    <section id="redesign" className="wx-section" aria-labelledby="ba-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="ba-title" className="wx-h2"><Words text="Same clinic. Same content. Different site." /></h2>
          <Fade as="p" className="wx-body" delay={200}>Drag the handle. A redesign keeps everything that's working, and gives the rest a reason to exist.</Fade>
        </div>
        <Fade>
          <div ref={wrap} className="wx-ba" data-cursor="drag" onPointerDown={e => { dragging.current = true; setFromEvent(e.clientX); }}
            role="slider" aria-label="Compare the old and new clinic website" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)} tabIndex={0}
            onKeyDown={e => { if (e.key === "ArrowLeft") setPos(p => Math.max(0, p - 5)); if (e.key === "ArrowRight") setPos(p => Math.min(100, p + 5)); }}>
            <div className="wx-ba__before">
              <div className="wx-ba__old">
                <div className="wx-ba__old-head"><b>Riverside Dental Clinic</b><span>Home | About Us | Services | Contact Us | FAQ | Testimonials</span></div>
                <div className="wx-ba__old-hero"><span>WELCOME TO OUR WEBSITE!!</span><p>Riverside Dental Clinic has been serving the community since 2009. We offer a wide range of services. Please click here to learn more about our services or contact us today for an appointment. Thank you for visiting.</p></div>
                <div className="wx-ba__old-cols"><div><b>Latest News</b><i /><i /><i /></div><div><b>Opening Hours</b><i /><i /><i /></div><div><b>Links</b><i /><i /><i /></div></div>
                <div className="wx-ba__old-foot">Copyright © 2009. All rights reserved. Best viewed in Internet Explorer.</div>
              </div>
            </div>
            <div className="wx-ba__after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
              <div className="wx-ba__new">
                <div className="wx-ba__new-nav"><b>Riverside Dental</b><span>Treatments</span><span>Team</span><span>Fees</span><em>Book online</em></div>
                <div className="wx-ba__new-hero">
                  <div className="wx-ba__new-title">Gentle dentistry, ten minutes from the river.</div>
                  <div className="wx-ba__new-sub">Check-ups, hygiene and cosmetic treatment. Same-week appointments, clear prices, no lectures.</div>
                  <div className="wx-ba__new-cta"><em>Book a check-up</em><span>Call 022 4000 0000</span></div>
                </div>
                <div className="wx-ba__new-cards"><div><b>Check-up</b><span>from ₹800</span></div><div><b>Hygiene</b><span>from ₹1,500</span></div><div><b>Whitening</b><span>from ₹9,000</span></div></div>
              </div>
            </div>
            <div className="wx-ba__handle" style={{ left: `${pos}%` }}><span /></div>
            <div className="wx-ba__tag wx-ba__tag--l" style={{ opacity: pos > 12 ? 1 : 0 }}>Before</div>
            <div className="wx-ba__tag wx-ba__tag--r" style={{ opacity: pos < 88 ? 1 : 0 }}>After</div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ── Launch checklist: items check themselves off as you scroll ── */
const CHECKS = [
  ["Loads in under a second on a phone", "Images sized and lazy-loaded, fonts subset, no bloated scripts."],
  ["Readable by search engines", "Real headings, descriptive links, metadata and structured data on every page."],
  ["Works with a keyboard and a screen reader", "Focus states, labels, contrast and motion preferences respected."],
  ["Editable without code", "Change words, prices and photos yourself. We record the handover."],
  ["Your domain, your hosting, your name", "Nothing is locked to us. Leave any time and take everything."],
  ["Analytics that don't track people", "You see which pages work. Visitors don't get followed around the internet."],
  ["Backed up and monitored", "Automatic backups, uptime alerts, and a human who reads them."],
  ["A month of care included", "Fixes and small changes after launch, no extra invoice."],
];
export function Checklist() {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = list.current; if (!el) return;
    const items = gsap.utils.toArray<HTMLElement>("li", el);
    if (prefersReducedMotion()) { items.forEach(i => i.classList.add("is-done")); return; }
    const st = ScrollTrigger.create({
      trigger: el, start: "top 70%", end: "bottom 60%", scrub: true,
      onUpdate: self => { items.forEach((it, i) => it.classList.toggle("is-done", self.progress >= (i + 0.5) / items.length)); },
    });
    return () => st.kill();
  }, []);
  return (
    <section id="checklist" className="wx-section" aria-labelledby="check-title">
      <div className="wx-container wx-check">
        <div className="wx-check__head">
          <h2 id="check-title" className="wx-h2"><Words text="Every site ships with all of this." /></h2>
          <Fade as="p" className="wx-body" delay={200}>Not optional extras. Not a premium tier. The list we work through before anything goes live.</Fade>
        </div>
        <ol ref={list} className="wx-check__list">
          {CHECKS.map(([t, d]) => (
            <li key={t}>
              <span className="wx-check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg></span>
              <div><h3>{t}</h3><p className="wx-small">{d}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Chapter rail: where you are on the page (desktop) ── */
export function Chapters() {
  const [active, setActive] = useState("");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const ids = NAV.map(n => n.href.slice(1));
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9 && document.documentElement.scrollHeight - window.scrollY - window.innerHeight > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <nav className={`wx-chapters ${visible ? "is-visible" : ""}`} aria-label="Chapters">
      {NAV.map((n, i) => (
        <a key={n.href} href={n.href} className={active === n.href.slice(1) ? "is-active" : ""} aria-current={active === n.href.slice(1) ? "true" : undefined}>
          <span className="wx-num">{String(i + 1).padStart(2, "0")}</span><em>{n.label}</em>
        </a>
      ))}
    </nav>
  );
}
