import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { PROJECTS } from "./data";
import { Words, Magnetic, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

const HeroScene = lazy(() => import("./HeroCombined"));

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/** Three statements the visitor scrolls through while flying down the corridor. */
/**
 * Six beats. Three while flying down the corridor, one that swells and glows
 * as it hands over, then two over the structure.
 */
const LINES: { text: string; from: number; to: number; zoom?: boolean }[] = [
  { text: "Websites that make your business look legit.", from: 0.0, to: 0.2 },
  { text: "Built by one person who answers their own email.", from: 0.2, to: 0.38 },
  { text: "Fast to load. Easy to find. Ready in weeks.", from: 0.38, to: 0.5 },
  { text: "Let's see how it works.", from: 0.5, to: 0.66, zoom: true },
  { text: "Underneath, every site is the same job.", from: 0.66, to: 0.84 },
  { text: "Structure, speed, and words that say something.", from: 0.84, to: 1.0 },
];

/** Chapter labels under the progress line, so the long hero has a sense of place. */
const BEATS = ["The work", "Who builds it", "The promise", "How it works", "Structure"];

export default function Hero({ ready, onStart }: { ready: boolean; onStart: () => void }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const active = useRef(true);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const tick = useRef<HTMLSpanElement>(null);
  const beatRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const s = section.current;
    if (!s || prefersReducedMotion()) return;
    const st = ScrollTrigger.create({
      trigger: s, start: "top top", end: "bottom bottom",
      onToggle: self => { active.current = self.isActive || self.progress === 0; },
      onUpdate: self => {
        const p = self.progress;
        progress.current = p;
        // crossfade the statements
        LINES.forEach((l, i) => {
          const el = lineRefs.current[i];
          if (!el) return;
          const inT = gsap.utils.clamp(0, 1, (p - l.from) / 0.05);
          const outT = i === LINES.length - 1 ? 1 : gsap.utils.clamp(0, 1, (l.to - p) / 0.05);
          const o = i === 0 ? outT : Math.min(inT, outT);
          el.style.opacity = String(o);
          el.style.visibility = o > 0.01 ? "visible" : "hidden";

          if (l.zoom) {
            // Swells and burns brighter across its own stretch of scroll, then
            // hands the screen to the structure.
            const local = gsap.utils.clamp(0, 1, (p - l.from) / (l.to - l.from));
            const scale = 1 + local * 0.85;
            const glow = 10 + local * 70;
            el.style.transform = `scale(${scale})`;
            el.style.filter = `blur(${(1 - o) * 6}px)`;
            el.style.textShadow = `0 0 ${glow}px rgba(212,136,75,${0.25 + local * 0.6}), 0 0 ${glow * 2.4}px rgba(212,136,75,${local * 0.35})`;
            el.style.color = `color-mix(in oklab, #f3f1ec ${100 - local * 22}%, #d4884b)`;
          } else {
            el.style.transform = `translateY(${(1 - o) * (p > (l.from + l.to) / 2 ? -14 : 14)}px)`;
          }
        });
        if (tick.current) tick.current.style.transform = `scaleX(${p})`;
        const beat = Math.min(BEATS.length - 1, Math.floor(p * BEATS.length));
        beatRefs.current.forEach((el, i) => el?.classList.toggle("is-on", i === beat));
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={section} className="wx-hero" id="top" aria-labelledby="hero-title">
      <div className="wx-hero__sticky">
        <div className="wx-hero__bg" aria-hidden="true" />
        {mounted && ready && (
          <Suspense fallback={null}>
            <HeroScene projects={PROJECTS} progress={progress} active={active} />
          </Suspense>
        )}
        <div className="wx-hero__vignette" aria-hidden="true" />

        <div className="wx-container wx-hero__stage">
          <div className="wx-hero__lines">
            <h1 id="hero-title" ref={el => { lineRefs.current[0] = el; }} className="wx-display wx-hero__line">
              <Words text={LINES[0].text} immediate={ready} delay={250} />
            </h1>
            {LINES.slice(1).map((l, i) => (
              <p key={l.text} ref={el => { lineRefs.current[i + 1] = el; }} className={`wx-display wx-hero__line ${l.zoom ? "is-zoom" : ""}`} style={{ opacity: 0, visibility: "hidden" }} aria-hidden="true">
                {l.text}
              </p>
            ))}
          </div>

          <div className="wx-hero__aside">
            <p className="wx-lead wx-fade" style={{ ["--d" as string]: "800ms" }} data-hero-fade>
              A one-person design and build studio for cafés, gyms, restaurants and small software companies. New, and pricing like it.
            </p>
            <div className="wx-hero__ctas wx-fade" style={{ ["--d" as string]: "950ms" }} data-hero-fade>
              <Magnetic className="wx-btn--copper" onClick={onStart}>Start a project <Arrow /></Magnetic>
              <Magnetic className="wx-btn--ghost" href="#work">See the work</Magnetic>
            </div>
          </div>
        </div>

        <div className="wx-container wx-hero__foot wx-fade" style={{ ["--d" as string]: "1200ms" }} data-hero-fade>
          <span className="wx-hero__beats" aria-hidden="true">
            {BEATS.map((b, i) => (
              <span key={b} ref={el => { beatRefs.current[i] = el; }}>{b}</span>
            ))}
          </span>
          <span className="wx-hero__tick" aria-hidden="true"><span ref={tick} /></span>
          <a href="#work" className="wx-hero__skip">Skip the intro</a>
        </div>
      </div>
      {ready && <style>{`[data-hero-fade]{opacity:1;transform:none}`}</style>}
    </section>
  );
}
