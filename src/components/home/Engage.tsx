import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "./data";
import ProjectFrame from "./ProjectFrame";
import { Fade, Words, Magnetic, scrollToId } from "./motion";

const ease = [0.16, 1, 0.3, 1] as const;
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/* ── Instagram ─────────────────────────────────────────────────────────────
   Change HANDLE and the site follows it everywhere. */
export const INSTAGRAM_HANDLE = "webrixo";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/**
 * Three questions, one answer.
 *
 * Most visitors leave a studio site without doing anything, because nothing on
 * the page asks them a question they want answered. This does: it tells them
 * which route suits them and roughly what it costs, in about fifteen seconds,
 * and hands them straight to the right part of the page.
 */

type Choice = { label: string; note: string; score: { human: number; ai: number }; pages?: number };
type Question = { id: string; q: string; sub: string; choices: Choice[] };

const QUESTIONS: Question[] = [
  {
    id: "have",
    q: "What have you got right now?",
    sub: "Be honest, nobody's judging.",
    choices: [
      { label: "Nothing at all", note: "Not even a page", score: { human: 1, ai: 2 }, pages: 3 },
      { label: "Just social media", note: "Instagram is doing the work", score: { human: 2, ai: 2 }, pages: 4 },
      { label: "An old site", note: "It works, it's just dated", score: { human: 3, ai: 1 }, pages: 5 },
      { label: "A site I hate", note: "Built by someone else", score: { human: 3, ai: 0 }, pages: 5 },
    ],
  },
  {
    id: "need",
    q: "What does it actually need to do?",
    sub: "Pick the one that matters most.",
    choices: [
      { label: "Be found on search", note: "People are looking for you", score: { human: 2, ai: 1 } },
      { label: "Take bookings or orders", note: "Stop answering the phone", score: { human: 3, ai: 0 } },
      { label: "Look credible", note: "You have customers already", score: { human: 2, ai: 1 } },
      { label: "Just exist properly", note: "Somewhere to point people", score: { human: 0, ai: 3 } },
    ],
  },
  {
    id: "when",
    q: "When do you need it live?",
    sub: "There's no wrong answer here.",
    choices: [
      { label: "Today, ideally", note: "Something is better than nothing", score: { human: 0, ai: 3 } },
      { label: "In a few weeks", note: "Worth doing properly", score: { human: 3, ai: 0 } },
      { label: "No real deadline", note: "Get it right, not fast", score: { human: 2, ai: 1 } },
    ],
  },
];

export function Matcher() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Choice[]>([]);

  const answer = (c: Choice) => {
    const next = [...picks, c];
    setPicks(next);
    setStep(s => s + 1);
  };

  const reset = () => { setPicks([]); setStep(0); };

  const done = step >= QUESTIONS.length;
  const human = picks.reduce((s, p) => s + p.score.human, 0);
  const ai = picks.reduce((s, p) => s + p.score.ai, 0);
  const pickHuman = human >= ai;
  const pages = picks.find(p => p.pages)?.pages ?? 4;

  return (
    <section id="match" className="wx-section" aria-labelledby="match-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="match-title" className="wx-h2"><Words text="Not sure which route is yours?" /></h2>
          <Fade as="p" className="wx-body" delay={200}>
            Three questions, about fifteen seconds. No email, no "download your report" — the answer just appears.
          </Fade>
        </div>

        <Fade className="wx-match">
          <div className="wx-match__progress" aria-hidden="true">
            {QUESTIONS.map((_, i) => <span key={i} className={i < step ? "is-done" : i === step ? "is-on" : ""} />)}
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={step} className="wx-match__step"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease }}>
                <p className="wx-small">Question {step + 1} of {QUESTIONS.length}</p>
                <h3 className="wx-h3">{QUESTIONS[step].q}</h3>
                <p className="wx-small">{QUESTIONS[step].sub}</p>
                <div className="wx-match__choices">
                  {QUESTIONS[step].choices.map((c, i) => (
                    <motion.button key={c.label} onClick={() => answer(c)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}>
                      <b>{c.label}</b>
                      <span>{c.note}</span>
                    </motion.button>
                  ))}
                </div>
                {step > 0 && (
                  <button className="wx-match__back" onClick={() => { setPicks(p => p.slice(0, -1)); setStep(s => s - 1); }}>
                    Back a question
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="result" className="wx-match__result"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
                <p className="wx-small">Based on your answers</p>
                <h3 className="wx-h2 wx-match__verdict" style={{ ["--v" as string]: pickHuman ? "var(--wx-copper)" : "var(--wx-signal)" }}>
                  {pickHuman ? "Build it with a human." : "Start with AI."}
                </h3>
                <p className="wx-body">
                  {pickHuman
                    ? `You've got something specific to say and time to say it properly. A ${pages}-page custom build is the right shape — designed on your content, not a template.`
                    : "You need something live and decent quickly. Generate a first version, publish it, and upgrade to a custom build later if the site starts earning its keep."}
                </p>
                <div className="wx-match__actions">
                  <Magnetic className={pickHuman ? "wx-btn--copper" : "wx-btn--signal"} onClick={() => scrollToId("contact")}>
                    {pickHuman ? "Talk to us" : "Build with AI"} <Arrow />
                  </Magnetic>
                  <button className="wx-btn wx-btn--ghost" onClick={() => scrollToId("pricing")}>See what it costs</button>
                  <button className="wx-match__back" onClick={reset}>Start over</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Fade>
      </div>
    </section>
  );
}

/* ── Instagram ── */
export function Instagram() {
  return (
    <section id="instagram" className="wx-section wx-ig" aria-labelledby="ig-title">
      <div className="wx-container">
        <div className="wx-ig__head">
          <div>
            <h2 id="ig-title" className="wx-h2"><Words text="We post the work as it happens." /></h2>
            <Fade as="p" className="wx-body" delay={180}>
              Half-finished pages, things that didn't work, and the odd finished site. Follow along if you want to
              see how it actually gets made.
            </Fade>
          </div>
          <Fade delay={260}>
            <a className="wx-ig__handle" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @{INSTAGRAM_HANDLE}
            </a>
          </Fade>
        </div>

        <div className="wx-ig__grid">
          {PROJECTS.map((p, i) => (
            <Fade key={p.slug} delay={i * 80}>
              <a className="wx-ig__tile" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on Instagram`}>
                <ProjectFrame project={p} />
                <span className="wx-ig__meta">
                  <b>{p.name}</b>
                  <span>{p.sector}</span>
                </span>
              </a>
            </Fade>
          ))}
        </div>

        <Fade delay={200}>
          <p className="wx-small wx-ig__note">
            Prefer email? <Link to="/#contact" className="wx-link">Send us a line instead</Link>.
          </p>
        </Fade>
      </div>
    </section>
  );
}
