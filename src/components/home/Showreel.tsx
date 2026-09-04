import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { PROJECTS } from "./data";
import ProjectFrame from "./ProjectFrame";
import { Fade, Words, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

export default function Showreel() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 48rem)", () => {
      const t = track.current!, v = viewport.current!, s = section.current!;
      const distance = () => t.scrollWidth - v.clientWidth;
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: self => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`; },
        },
      });
      // Parallax inside each frame: the preview drifts slower than the panel.
      const frames = gsap.utils.toArray<HTMLElement>(".wx-reel__media > .wx-frame");
      frames.forEach(f => {
        gsap.fromTo(f, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: s, start: "top top", end: () => `+=${distance()}`, scrub: true } });
      });
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} id="work" className="wx-section wx-reel" aria-labelledby="work-title">
      <div className="wx-container wx-section-head">
        <h2 id="work-title" className="wx-h2"><Words text="Work you can click through, not just look at." /></h2>
        <Fade as="p" className="wx-body" delay={200}>Every project below is a live demo we designed and built. Open one, resize it, scroll it on your phone.</Fade>
      </div>

      <div className="wx-reel__viewport" ref={viewport}>
        <div className="wx-reel__track" ref={track}>
          {PROJECTS.map((p, i) => (
            <article key={p.slug} className="wx-reel__panel">
              <Link to={p.href} className="wx-reel__media" data-cursor="view" aria-label={`Open the ${p.name} demo`}>
                <ProjectFrame project={p} />
              </Link>
              <div className="wx-reel__meta">
                <div>
                  <div className="wx-reel__idx wx-num">{String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}</div>
                  <h3 className="wx-h3">{p.name}</h3>
                  <p className="wx-small" style={{ marginTop: "0.25rem" }}>{p.sector}</p>
                </div>
                <p className="wx-body">{p.summary}</p>
                <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
                  <div className="wx-reel__tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
                  <Link to={p.href} className="wx-link">Open live demo</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="wx-reel__progress" aria-hidden="true"><span ref={bar} /></div>
    </section>
  );
}
