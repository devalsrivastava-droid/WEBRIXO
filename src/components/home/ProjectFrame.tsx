import type { Project } from "./data";

/**
 * A lightweight, CSS-only impression of each demo site. No images to load,
 * scales with its container (container queries), and keeps the palette of the
 * real demo so the showreel reads as "our work" rather than placeholders.
 */
export default function ProjectFrame({ project, className }: { project: Project; className?: string }) {
  const f = project.frame;
  return (
    <div
      className={`wx-frame ${f.serif ? "wx-frame--serif" : ""} ${className ?? ""}`}
      style={{
        ["--f-bg" as string]: f.bg,
        ["--f-ink" as string]: f.ink,
        ["--f-accent" as string]: f.accent,
        ["--f-accent-ink" as string]: f.accentInk ?? "#fff",
      }}
      aria-hidden="true"
    >
      <div className="wx-frame__chrome">
        <span>{project.name}</span>
        {f.nav.map(n => <span key={n}>{n}</span>)}
        <span className="sp" />
        <span className="wx-frame__pill">{f.cta}</span>
      </div>
      <div className="wx-frame__hero">
        <div className="wx-frame__title">{f.title}</div>
        <div className="wx-frame__sub">{f.sub}</div>
      </div>
      <div className="wx-frame__row">
        <div className="wx-frame__card"><div className="wx-frame__photo" /></div>
        <div className="wx-frame__card wx-frame__card--accent" />
        <div className="wx-frame__card" />
      </div>
    </div>
  );
}
