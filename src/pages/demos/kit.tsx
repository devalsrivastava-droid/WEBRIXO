import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Link } from "react-router";
import "@/styles/demo.css";

/**
 * Shared pieces for the four demo sites.
 *
 * Deliberately lighter than the studio homepage: no WebGL, no pinning, no
 * smooth-scroll hijack. These are the sort of sites a café or a gym actually
 * wants — quick, tactile, and calm enough to read. Everything respects
 * `prefers-reduced-motion`.
 */

export const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Loads a Google font once per page without blocking first paint. */
export function useFont(href: string) {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }, [href]);
}

/** Paints the page background so overscroll matches the design. */
export function usePageBackground(color: string) {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = color;
    return () => { document.body.style.background = prev; };
  }, [color]);
}

/** Fade and rise on entry, once. */
export function Reveal({ children, delay = 0, y = 22, className, style, as: Tag = "div" }: {
  children: ReactNode; delay?: number; y?: number; className?: string; style?: CSSProperties;
  as?: "div" | "section" | "li" | "article" | "header" | "figure";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: "-8% 0px", threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`d-reveal ${className ?? ""}`}
      style={{ ...style, ["--d" as string]: `${delay}ms`, ["--y" as string]: `${y}px` }}>
      {children}
    </Tag>
  );
}

/** Headline that wipes up line by line. */
export function Rise({ text, className, delay = 0, as: Tag = "h2" }: {
  text: string; className?: string; delay?: number; as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: "-6% 0px", threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`d-rise ${className ?? ""}`}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="d-rise__w"><span style={{ ["--i" as string]: i, ["--d" as string]: `${delay}ms` }}>{w}</span></span>
      ))}
    </Tag>
  );
}

/** Endless horizontal band of words. */
export function Marquee({ items, speed = 34, className }: { items: string[]; speed?: number; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`d-marquee ${className ?? ""}`} aria-hidden="true">
      <div className="d-marquee__track" style={{ ["--speed" as string]: `${speed}s` }}>
        {row.map((t, i) => <span key={i}>{t}<i /></span>)}
      </div>
    </div>
  );
}

/** Counts up once in view. */
export function Count({ to, suffix = "", prefix = "", decimals = 0 }: {
  to: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (v: number) => { el.textContent = prefix + v.toFixed(decimals) + suffix; };
    if (reduced()) { write(to); return; }
    write(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        write(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix, prefix, decimals]);
  return <span ref={ref} className="d-count">{prefix}{to}{suffix}</span>;
}

/** Moves slower than the page as it scrolls past. */
export function Parallax({ children, amount = 40, className, style }: {
  children: ReactNode; amount?: number; className?: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-mid / window.innerHeight) * amount}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [amount]);
  return <div ref={ref} className={className} style={{ willChange: "transform", ...style }}>{children}</div>;
}

/** Card that tilts a little toward the cursor. */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
      el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [max]);
  return <div ref={ref} className={`d-tilt ${className ?? ""}`}>{children}</div>;
}

/** A thin bar at the top marking these as WEBRIXO demos, not real businesses. */
export function DemoBar({ label }: { label: string }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`d-bar ${solid ? "is-solid" : ""}`}>
      <Link to="/" className="d-bar__back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H6M12 5l-7 7 7 7" /></svg>
        WEBRIXO
      </Link>
      <span className="d-bar__tag">Concept build — {label}</span>
    </div>
  );
}

/** Closing strip on every demo, pointing back at the studio. */
export function DemoFooter({ name, line }: { name: string; line: string }) {
  return (
    <footer className="d-foot">
      <Reveal>
        <p className="d-foot__eyebrow">This is a concept build</p>
        <h2 className="d-foot__h">{line}</h2>
        <p className="d-foot__p">
          {name} isn't a real business. WEBRIXO built this to show what a site like it could be —
          so you can judge the work before paying for any of it.
        </p>
        <Link to="/#contact" className="d-foot__cta">
          Start a project
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </Link>
      </Reveal>
    </footer>
  );
}
