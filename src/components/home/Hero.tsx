import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { PROJECTS } from "./data";
import { Words, Magnetic, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

const HeroScene = lazy(() => import("./HeroScene"));

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/** Three statements the visitor scrolls through while flying down the corridor. */
const LINES = [
  { text: "Websites that make your business look legit.", from: 0.0, to: 0.3 },
  { text: "Built by two people who answer their own email.", from: 0.3, to: 0.64 },
  { text: "Fast to load. Easy to find. Ready in weeks.", from: 0.64, to: 1.0 },
];

export default function Hero({ ready, onStart }: { ready: boolean; onStart: () => void }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const active = useRef(true);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const tick = useRef<HTMLSpanElement>(null);
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
          el.style.transform = `translateY(${(1 - o) * (p > (l.from + l.to) / 2 ? -14 : 14)}px)`;
          el.style.visibility = o > 0.01 ? "visible" : "hidden";
        });
        if (tick.current) tick.current.style.transform = `scaleX(${p})`;
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
              <p key={l.text} ref={el => { lineRefs.current[i + 1] = el; }} className="wx-display wx-hero__line" style={{ opacity: 0, visibility: "hidden" }} aria-hidden="true">
                {l.text}
              </p>
            ))}
          </div>

          <div className="wx-hero__aside">
            <p className="wx-lead wx-fade" style={{ ["--d" as string]: "800ms" }} data-hero-fade>
              A two-person design and build studio for cafés, gyms, restaurants and small software companies.
            </p>
            <div className="wx-hero__ctas wx-fade" style={{ ["--d" as string]: "950ms" }} data-hero-fade>
              <Magnetic className="wx-btn--copper" onClick={onStart}>Start a project <Arrow /></Magnetic>
              <Magnetic className="wx-btn--ghost" href="#work">See the work</Magnetic>
            </div>
          </div>
        </div>

        <div className="wx-container wx-hero__foot wx-fade" style={{ ["--d" as string]: "1200ms" }} data-hero-fade aria-hidden="true">
          <span>Scroll to fly through the work</span>
          <span className="wx-hero__tick"><span ref={tick} /></span>
          <span className="wx-num">{PROJECTS.length} live demos</span>
        </div>
      </div>
      {ready && <style>{`[data-hero-fade]{opacity:1;transform:none}`}</style>}
    </section>
  );
}
