import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { backendConfigured } from "@/lib/backend";
import { generateLocally, type SitePlan } from "@/lib/localGenerate";
import { Fade, Words, Magnetic, scrollToId } from "./motion";

const ease = [0.16, 1, 0.3, 1] as const;
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/**
 * Build it yourself.
 *
 * The human path is better and deliberately limited — one project at a time.
 * This is the other route: describe the business, get a first version in the
 * browser, edit any text in place, and take it away. Nothing here is a mockup
 * of a builder; the preview is the site, and every heading is contenteditable.
 */

const PALETTES: Record<SitePlan["palette"], { bg: string; ink: string; muted: string; accent: string; accentInk: string; line: string; serif: boolean }> = {
  warm:  { bg: "#f6efe4", ink: "#241c14", muted: "#8a7a66", accent: "#b4682a", accentInk: "#fdf8f0", line: "rgba(36,28,20,.14)", serif: true },
  fresh: { bg: "#0b1410", ink: "#eef7f0", muted: "#7d8a80", accent: "#4ade80", accentInk: "#04140a", line: "rgba(238,247,240,.14)", serif: false },
  deep:  { bg: "#140c09", ink: "#f5e9dc", muted: "#9c8877", accent: "#d9a441", accentInk: "#140c09", line: "rgba(245,233,220,.16)", serif: true },
  cool:  { bg: "#0b0b14", ink: "#eeeef8", muted: "#8b8ba7", accent: "#6d6dff", accentInk: "#ffffff", line: "rgba(238,238,248,.12)", serif: false },
  mono:  { bg: "#faf9f7", ink: "#14140f", muted: "#63615a", accent: "#14140f", accentInk: "#faf9f7", line: "rgba(20,20,15,.14)", serif: false },
};

const EXAMPLES = [
  "A small yoga studio in Thane opening in March. Morning and evening classes, first class free.",
  "A family dental clinic in Pune. We want people to book check-ups and know what things cost.",
  "A coffee roastery in Bandra. We roast on Tuesdays and sell beans and brew gear.",
];

/** Text the visitor can edit directly in the preview. */
function Edit({ value, onChange, as: Tag = "span", className }: {
  value: string; onChange: (v: string) => void; as?: "h1" | "h2" | "h3" | "p" | "span" | "b"; className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <Tag
      ref={ref as never}
      className={`gen-edit ${className ?? ""}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={e => onChange((e.target as HTMLElement).innerText.trim() || value)}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

export default function AiBuilder() {
  const generate = useAction(api.generate.site);
  const [brief, setBrief] = useState("");
  const [plan, setPlan] = useState<SitePlan | null>(null);
  const [source, setSource] = useState<"claude" | "local" | null>(null);
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  const patch = (p: Partial<SitePlan>) => setPlan(cur => (cur ? { ...cur, ...p } : cur));
  const patchItem = (si: number, ii: number, field: "title" | "body" | "meta", v: string) =>
    setPlan(cur => {
      if (!cur) return cur;
      const sections = cur.sections.map((s, i) =>
        i !== si ? s : { ...s, items: s.items.map((it, j) => (j !== ii ? it : { ...it, [field]: v })) });
      return { ...cur, sections };
    });

  async function build() {
    if (brief.trim().length < 12) { setError("Give us a sentence or two about the business first."); return; }
    setState("working"); setError("");
    try {
      if (!backendConfigured) throw new Error("no-key");
      const res = await generate({ brief });
      setPlan(res.plan as SitePlan);
      setSource("claude");
      setState("idle");
    } catch (err) {
      // A missing key or an unreachable model shouldn't leave the visitor with
      // nothing — fall back and say which generator ran.
      const msg = err instanceof Error ? err.message : "";
      await new Promise(r => setTimeout(r, 700));
      setPlan(generateLocally(brief));
      setSource("local");
      setState("idle");
      if (msg && !msg.includes("no-key") && !msg.includes("generator-unavailable")) setError("");
    }
  }

  const p = plan ? PALETTES[plan.palette] ?? PALETTES.mono : PALETTES.mono;

  return (
    <section id="ai-build" className="wx-section" aria-labelledby="aib-title">
      <div className="wx-container">
        <div className="wx-section-head">
          <h2 id="aib-title" className="wx-h2"><Words text="Or build it yourself, right here." /></h2>
          <Fade as="p" className="wx-body" delay={200}>
            Describe the business in a sentence. You'll get a first version in about a minute — then edit any words
            on it by clicking them. No account, no card, nothing to install.
          </Fade>
        </div>

        <div className="wx-aib">
          {/* Prompt */}
          <div className="wx-aib__prompt">
            <label className="wx-h3" htmlFor="aib">What's the business?</label>
            <textarea id="aib" className="wx-brief" rows={4} value={brief} onChange={e => setBrief(e.target.value)}
              placeholder="A small yoga studio in Thane opening in March. Morning and evening classes, first class free, people should be able to book online." />
            <div className="wx-aib__examples">
              {EXAMPLES.map((e, i) => (
                <button key={i} onClick={() => setBrief(e)} className="wx-chip">{e.split(".")[0]}</button>
              ))}
            </div>
            {error && <p className="wx-form__status is-error" role="alert">{error}</p>}
            <Magnetic className="wx-btn--signal" onClick={build}>
              {state === "working" ? "Building your site" : plan ? "Build it again" : "Build my site"} <Arrow />
            </Magnetic>
            {plan && (
              <p className="wx-small wx-aib__source">
                {source === "claude"
                  ? "Written by Claude from your description."
                  : "Written by the offline generator — the model isn't connected on this build."}
                {" "}Click any text on the right to change it.
              </p>
            )}
          </div>

          {/* Live, editable preview */}
          <div className="wx-aib__preview">
            <div className="wx-aib__chrome">
              <span /><span /><span />
              <em>{plan ? `${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com` : "yourbusiness.com"}</em>
            </div>

            <div className="wx-aib__viewport">
              <AnimatePresence mode="wait">
                {state === "working" ? (
                  <motion.div key="working" className="wx-aib__working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span className="wx-aib__bar"><i /></span>
                    <p className="wx-small">Writing your pages…</p>
                  </motion.div>
                ) : !plan ? (
                  <motion.div key="empty" className="wx-aib__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="wx-small">Your site appears here.</p>
                  </motion.div>
                ) : (
                  <motion.div key={plan.name + source} className="gen" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
                    style={{
                      ["--g-bg" as string]: p.bg, ["--g-ink" as string]: p.ink, ["--g-muted" as string]: p.muted,
                      ["--g-accent" as string]: p.accent, ["--g-accent-ink" as string]: p.accentInk, ["--g-line" as string]: p.line,
                      ["--g-display" as string]: p.serif ? "Georgia, 'Times New Roman', serif" : "inherit",
                    }}>
                    <header className="gen-nav">
                      <Edit as="b" value={plan.name} onChange={v => patch({ name: v })} />
                      <nav>{plan.nav.map((n, i) => <span key={i}>{n}</span>)}</nav>
                      <Edit as="span" className="gen-cta" value={plan.cta} onChange={v => patch({ cta: v })} />
                    </header>

                    <div className="gen-hero">
                      <Edit as="h1" className="gen-h1" value={plan.tagline} onChange={v => patch({ tagline: v })} />
                      <Edit as="p" className="gen-about" value={plan.about} onChange={v => patch({ about: v })} />
                    </div>

                    {plan.sections.map((s, si) => (
                      <section key={si} className={`gen-sec gen-sec--${s.kind}`}>
                        <Edit as="h2" className="gen-h2" value={s.title} onChange={v => setPlan(cur => cur ? { ...cur, sections: cur.sections.map((x, i) => i === si ? { ...x, title: v } : x) } : cur)} />
                        <div className="gen-items">
                          {s.items.map((it, ii) => (
                            <div key={ii} className="gen-item">
                              <div>
                                <Edit as="b" value={it.title} onChange={v => patchItem(si, ii, "title", v)} />
                                <Edit as="p" value={it.body} onChange={v => patchItem(si, ii, "body", v)} />
                              </div>
                              {it.meta && <Edit as="span" className="gen-meta" value={it.meta} onChange={v => patchItem(si, ii, "meta", v)} />}
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}

                    <footer className="gen-foot"><Edit as="span" value={plan.footnote} onChange={v => patch({ footnote: v })} /></footer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {plan && (
              <div className="wx-aib__actions">
                <button className="wx-btn wx-btn--sm" onClick={() => scrollToId("contact")}>Publish this with us</button>
                <button className="wx-btn wx-btn--ghost wx-btn--sm" onClick={() => scrollToId("build")}>Hand it to a human instead</button>
              </div>
            )}
          </div>
        </div>

        <Fade as="p" className="wx-small wx-aib__note" delay={140}>
          Built this way, the site is yours to edit and publish — quick, cheap, and good enough for most
          businesses. Working with a person costs more and takes weeks, but it's made on your content rather than
          assembled from a pattern. We only take on one custom project at a time, so that route has a queue. This one
          never does.
        </Fade>
      </div>
    </section>
  );
}
