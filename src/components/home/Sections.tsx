import { useEffect, useRef } from "react";
import { PROCESS, VALUES } from "./data";
import { Fade, Words, Magnetic, useInView, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/* ── Two ways to build ── */
function Path({ accent, name, tagline, facts, cta, ctaClass, onClick, note }: {
  accent: string; name: string; tagline: string; facts: [string, string][]; cta: string; ctaClass: string; onClick: () => void; note: string;
}) {
  const ref = useInView<HTMLDivElement>("-20% 0px");
  return (
    <div ref={ref} className="wx-path" style={{ ["--p-accent" as string]: accent }}>
      <div className="wx-path__head">
        <h3 className="wx-h3">{name}</h3>
        <span className="wx-path__dot" aria-hidden="true" />
      </div>
      <p className="wx-body">{tagline}</p>
      <dl className="wx-path__facts">
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="wx-path__foot">
        <Magnetic className={ctaClass} onClick={onClick}>{cta} <Arrow /></Magnetic>
        <span className="wx-small">{note}</span>
      </div>
    </div>
  );
}

export function Paths({ onStart }: { onStart: (mode: "ai" | "human") => void }) {
  return (
    <section id="paths" className="wx-section" aria-labelledby="paths-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="paths-title" className="wx-h2"><Words text="Two ways to get a site. Same care in both." /></h2>
          <Fade as="p" className="wx-body" delay={200}>Start fast with a generated first version, or work with us on something made for your business. You can switch from one to the other at any point.</Fade>
        </div>
        <div className="wx-paths">
          <Path
            accent="var(--wx-signal)"
            name="Build with AI"
            tagline="Describe the business, get a first version in a minute, then edit the words yourself and publish. Always available, no queue, no waiting on us."
            facts={[["Ready in", "Minutes"], ["Best for", "Getting something decent live today"], ["You get", "Editable pages, hosting, your domain"], ["Availability", "Unlimited, start whenever"]]}
            cta="Build with AI"
            ctaClass="wx-btn--signal"
            onClick={() => onStart("ai")}
            note="Free, start now"
          />
          <Path
            accent="var(--wx-copper)"
            name="Build with a human"
            tagline="Designed and built on your content, not assembled from a pattern. Better in every way that matters — but it is one person, so there is a queue."
            facts={[["Ready in", "2 to 4 weeks"], ["Best for", "A site that has to win customers"], ["You get", "Custom design, copy, build and launch"], ["Availability", "One project at a time"]]}
            cta="Talk to us"
            ctaClass="wx-btn--copper"
            onClick={() => onStart("human")}
            note="Quote after a 20-minute call"
          />
        </div>
      </div>
    </section>
  );
}

/* ── Process ── */
export function Process() {
  const rail = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!rail.current || !list.current || prefersReducedMotion()) return;
    const st = gsap.fromTo(rail.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: true } });
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);
  return (
    <section id="process" className="wx-section" aria-labelledby="process-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="process-title" className="wx-h2"><Words text="Four steps from first call to launch." /></h2>
          <Fade as="p" className="wx-body" delay={200}>No discovery phases, no decks. You'll know what we're building and when it lands before the first call ends.</Fade>
        </div>
        <div className="wx-process">
          <div className="wx-process__rail" aria-hidden="true"><span ref={rail} /></div>
          <ol ref={list} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PROCESS.map((s, i) => (
              <Fade as="li" key={s.title} className="wx-step" delay={i * 80}>
                <span className="wx-step__n">{String(i + 1).padStart(2, "0")}</span>
                <div className="wx-step__body">
                  <h3 className="wx-h3">{s.title}</h3>
                  <p className="wx-body">{s.body}</p>
                </div>
              </Fade>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── About: pinned manifesto whose words light up as you scroll ── */
const MANIFESTO = "WEBRIXO is one person. No account managers, no ticket queues, no junior handed your project after the pitch. You talk to whoever is building your site, and it stays that way after it is live.";
const KEY = new Set(["one", "person.", "whoever", "building"]);

export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const s = section.current, t = text.current;
    if (!s || !t || prefersReducedMotion()) return;
    const words = t.querySelectorAll<HTMLElement>(".w");
    const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: "top 65%", end: "bottom 95%", scrub: 0.5 } });
    words.forEach((w, i) => tl.to(w, { opacity: 1, y: 0, duration: 0.6 }, i * 0.05));
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);
  return (
    <section ref={section} id="about" className="wx-section wx-manifesto" aria-labelledby="about-title">
      <div className="wx-manifesto__sticky">
        <div className="wx-container">
          <h2 id="about-title" className="wx-small" style={{ marginBottom: "2rem" }}>About WEBRIXO</h2>
          <p ref={text} className="wx-manifesto__text">
            {MANIFESTO.split(" ").map((w, i) => <span key={i} className={`w ${KEY.has(w) ? "k" : ""}`}>{w}</span>)}
          </p>
          <div className="wx-values">
            {VALUES.map((v, i) => (
              <Fade key={v.title} className="wx-value" delay={i * 90}>
                <h3>{v.title}</h3>
                <p className="wx-body">{v.body}</p>
              </Fade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Interstitial: one giant line that grows as it enters ── */
export function Interstitial() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const tw = gsap.fromTo(el, { scale: 0.82, opacity: 0.2 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "center 45%", scrub: true } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, []);
  return (
    <div className="wx-inter" aria-hidden="true">
      <div ref={ref}><p className="wx-display">Ready when you are.</p></div>
    </div>
  );
}

export { ScrollTrigger };
