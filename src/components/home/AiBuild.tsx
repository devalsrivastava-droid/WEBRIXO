import { useEffect, useRef } from "react";
import { Words, Fade, Magnetic, gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

const STEPS = [
  { title: "Describe your business", body: "Two or three sentences. What you do, who it's for, how people should get in touch." },
  { title: "Watch the first version appear", body: "Pages, headings, copy and layout are generated for you in about a minute." },
  { title: "Edit, then publish", body: "Change anything you like in plain language, then put it live on your own domain." },
];

/**
 * A scrubbed timeline (no video): as the section scrolls, a browser mock
 * fills in piece by piece while the matching step on the left lights up.
 */
export default function AiBuild({ onStart }: { onStart: () => void }) {
  const section = useRef<HTMLElement>(null);
  const mock = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const s = section.current, m = mock.current;
    if (!s || !m) return;
    const q = gsap.utils.selector(m);
    if (prefersReducedMotion()) {
      gsap.set(q("[data-a]"), { opacity: 1, y: 0, scaleX: 1, width: "100%" });
      return;
    }
    gsap.set(q("[data-a]"), { opacity: 0, y: 14 });
    gsap.set(q("[data-a='url']"), { y: 0, width: 0, opacity: 1 });
    gsap.set(q("[data-a='cursor']"), { opacity: 1, y: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: s, start: "top top", end: "bottom bottom", scrub: 0.4,
        onUpdate: self => {
          const p = self.progress;
          stepRefs.current.forEach((el, i) => el?.classList.toggle("is-active", p >= i / 3 && p < (i + 1) / 3 || (i === 2 && p >= 1)));
        },
      },
    });
    tl.to(q("[data-a='prompt']"), { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(q("[data-a='url']"), { width: "100%", duration: 1.2 }, 0.2)
      .to(q("[data-a='cursor']"), { opacity: 0, duration: 0.2 }, 1.4)
      .to(q("[data-a='prompt']"), { opacity: 0, y: -10, duration: 0.5 }, 1.6)
      .to(q("[data-a='nav']"), { opacity: 1, y: 0, duration: 0.5 }, 1.8)
      .to(q("[data-a='title']"), { opacity: 1, y: 0, duration: 0.7 }, 2.1)
      .to(q("[data-a='sub']"), { opacity: 1, y: 0, duration: 0.6 }, 2.5)
      .to(q("[data-a='cta']"), { opacity: 1, y: 0, duration: 0.5 }, 2.8)
      .to(q("[data-a='card']"), { opacity: 1, y: 0, duration: 0.6, stagger: 0.25 }, 3.1)
      .to(q("[data-a='foot']"), { opacity: 1, y: 0, duration: 0.5 }, 4.0)
      .to(q("[data-a='live']"), { opacity: 1, y: 0, duration: 0.5 }, 4.5)
      .to({}, { duration: 0.6 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  return (
    <section ref={section} id="ai" className="wx-ai" aria-labelledby="ai-title">
      <div className="wx-ai__sticky">
        <div className="wx-container wx-ai__grid">
          <div className="wx-ai__copy">
            <h2 id="ai-title" className="wx-h2"><Words text="Or describe it, and watch a site build itself." /></h2>
            <ol className="wx-ai__steps">
              {STEPS.map((st, i) => (
                <li key={st.title} ref={el => { stepRefs.current[i] = el; }} className={`wx-ai__step ${i === 0 ? "is-active" : ""}`}>
                  <span className="wx-ai__n wx-num">{i + 1}</span>
                  <div>
                    <h3 className="wx-h3">{st.title}</h3>
                    <p className="wx-body">{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Fade delay={100}>
              <Magnetic className="wx-btn--signal" onClick={onStart}>Build with AI <Arrow /></Magnetic>
            </Fade>
          </div>

          <div className="wx-ai__mock" ref={mock} aria-hidden="true">
            <div className="wx-mock">
              <div className="wx-mock__bar">
                <span /><span /><span />
                <div className="wx-mock__url"><span data-a="url">sunriseyoga.studio</span><i data-a="cursor" /></div>
              </div>
              <div className="wx-mock__body">
                <div className="wx-mock__prompt" data-a="prompt">
                  <span className="wx-mock__label">Your description</span>
                  <p>"We're a small yoga studio in Thane. Morning and evening classes, first class free, people should be able to book online."</p>
                </div>
                <div className="wx-mock__site">
                  <div className="wx-mock__nav" data-a="nav"><b>Sunrise Yoga</b><span>Classes</span><span>Teachers</span><span>Pricing</span><em>Book a class</em></div>
                  <div className="wx-mock__title" data-a="title">Start your day on the mat.</div>
                  <div className="wx-mock__sub" data-a="sub">Morning and evening classes for every level. Your first class is free.</div>
                  <div className="wx-mock__cta" data-a="cta">Book your free class</div>
                  <div className="wx-mock__cards">
                    <div data-a="card"><b>6:30 am</b><span>Sunrise flow</span></div>
                    <div data-a="card"><b>12:15 pm</b><span>Lunch reset</span></div>
                    <div data-a="card"><b>7:00 pm</b><span>Evening slow</span></div>
                  </div>
                  <div className="wx-mock__foot" data-a="foot"><span>Sunrise Yoga, Thane</span><span>hello@sunriseyoga.studio</span></div>
                </div>
              </div>
              <div className="wx-mock__live" data-a="live"><i />Live on your domain</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
