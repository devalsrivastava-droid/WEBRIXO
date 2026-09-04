import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type ElementType } from "react";
import { Link, useNavigate } from "react-router";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeLenis: Lenis | null = null;

/** Scroll to an element by id, through Lenis when it's running. */
export function scrollToId(id: string, offset = -72) {
  const el = document.getElementById(id);
  if (!el) return;
  if (activeLenis) activeLenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/* ── Smooth scroll (Lenis) wired into GSAP's ticker ── */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
    activeLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links go through Lenis so they animate instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id ? document.getElementById(id) : document.body;
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -72, duration: 1.4 });
      try { try { history.replaceState(null, "", `#${id}`); } catch { /* file:// */ } } catch { /* file:// preview */ }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, [enabled]);
}

/* ── Adds .is-in when the element enters the viewport (once) ── */
export function useInView<T extends HTMLElement>(margin = "-12% 0px") {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } },
      { rootMargin: margin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return ref;
}

/* ── Word-mask reveal: each word rises out of its own clip ── */
export function Words({ text, as: Tag = "span", delay = 0, className, style, immediate = false }: {
  text: string; as?: ElementType; delay?: number; className?: string; style?: CSSProperties; immediate?: boolean;
}) {
  const ref = useInView<HTMLElement>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!immediate) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [immediate]);
  const words = text.split(" ");
  return (
    <Tag ref={immediate ? undefined : ref} className={`wx-lines ${className ?? ""} ${immediate && ready ? "is-in" : ""}`} style={style}>
      {words.map((w, i) => (
        <span key={i} className="wx-line" style={{ display: "inline-block", marginRight: "0.24em", verticalAlign: "top" }}>
          <span style={{ ["--i" as string]: i, ["--d" as string]: `${delay}ms` }}>{w}</span>
        </span>
      ))}
    </Tag>
  );
}

/* ── Fade-up on enter ── */
export function Fade({ children, delay = 0, as: Tag = "div", className, style }: {
  children: ReactNode; delay?: number; as?: ElementType; className?: string; style?: CSSProperties;
}) {
  const ref = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`wx-fade ${className ?? ""}`} style={{ ...style, ["--d" as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* ── Button with a subtle magnetic pull and a light that follows the pointer ── */
export function Magnetic({ children, className, href, to, onClick, type = "button", ariaLabel }: {
  children: ReactNode; className?: string; href?: string; to?: string; onClick?: () => void; type?: "button" | "submit"; ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.22); yTo(dy * 0.22);
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, []);
  const cls = `wx-btn ${className ?? ""}`;
  if (href) return <a ref={ref as never} href={href} className={cls} aria-label={ariaLabel}>{children}</a>;
  if (to) return <Link ref={ref as never} to={to} className={cls} aria-label={ariaLabel}>{children}</Link>;
  return <button ref={ref as never} type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>{children}</button>;
}

/* ── Cursor: instant dot, a ring that trails slightly, ripples on click ── */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = dot.current, r = ring.current, l = layer.current;
    if (!d || !r || !l || prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.querySelector(".wx");
    root?.classList.add("has-cursor");
    // dot: near-instant. ring: a short, deliberate trail.
    const dx = (x: number) => { d.style.setProperty("--cx", `${x}px`); };
    const dy = (y: number) => { d.style.setProperty("--cy", `${y}px`); };
    const rx = gsap.quickTo(r, "x", { duration: 0.18, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.18, ease: "power3.out" });
    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) { shown = true; gsap.set(r, { x: e.clientX, y: e.clientY }); d.style.opacity = "1"; r.style.opacity = "1"; }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = e.target as HTMLElement;
      const view = t.closest("[data-cursor='view']");
      const drag = t.closest("[data-cursor='drag']");
      const link = t.closest("a, button, [role='button'], input, textarea, select, label, summary");
      r.classList.toggle("is-view", !!view);
      r.classList.toggle("is-drag", !drag ? false : true);
      r.classList.toggle("is-link", !view && !drag && !!link);
      d.classList.toggle("is-hidden", !!view || !!drag);
    };
    const down = (e: MouseEvent) => {
      d.classList.add("is-press"); r.classList.add("is-press");
      const rip = document.createElement("span");
      rip.className = "wx-ripple";
      rip.style.left = `${e.clientX}px`; rip.style.top = `${e.clientY}px`;
      l.appendChild(rip);
      rip.addEventListener("animationend", () => rip.remove(), { once: true });
    };
    const up = () => { d.classList.remove("is-press"); r.classList.remove("is-press"); };
    const leave = () => { d.style.opacity = "0"; r.style.opacity = "0"; shown = false; };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move); window.removeEventListener("mousedown", down); window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      root?.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div ref={layer} className="wx-ripples" aria-hidden="true" />
      <div ref={ring} className="wx-cursor-ring" aria-hidden="true"><span className="wx-cursor-ring__label">View</span><span className="wx-cursor-ring__drag">Drag</span></div>
      <div ref={dot} className="wx-cursor-dot" aria-hidden="true" />
    </>
  );
}

/* ── Flip the fixed chrome (header, rail, cursor) while a light band
      is passing underneath it, so it never goes white-on-white. ── */
export function useChromeOnLight(selector = ".wx-invert") {
  useEffect(() => {
    const root = document.querySelector(".wx");
    const bands = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!root || !bands.length) return;
    const sts = bands.map(b => ScrollTrigger.create({
      trigger: b, start: "top 72px", end: "bottom 72px",
      onToggle: self => root.classList.toggle("is-on-light", self.isActive),
    }));
    return () => { sts.forEach(s => s.kill()); root.classList.remove("is-on-light"); };
  }, [selector]);
}

/* ── Thin reading-progress bar along the top edge ── */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const st = ScrollTrigger.create({ start: 0, end: () => document.documentElement.scrollHeight - window.innerHeight, onUpdate: s => { el.style.transform = `scaleX(${s.progress})`; } });
    return () => st.kill();
  }, []);
  return <div className="wx-progress" aria-hidden="true"><div ref={ref} /></div>;
}

/* ── Page wipe: internal links play a curtain before the route changes ── */
export function useWipeNavigation(enabled: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!enabled) return;
    const overlay = document.createElement("div");
    overlay.className = "wx-wipe"; overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//") || a.target === "_blank") return;
      e.preventDefault();
      if (prefersReducedMotion()) { navigate(href); return; }
      overlay.classList.add("is-in");
      setTimeout(() => {
        navigate(href); window.scrollTo(0, 0);
        setTimeout(() => { overlay.classList.remove("is-in"); overlay.classList.add("is-out"); setTimeout(() => overlay.classList.remove("is-out"), 700); }, 260);
      }, 520);
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); overlay.remove(); };
  }, [enabled, navigate]);
}

export { gsap, ScrollTrigger };
