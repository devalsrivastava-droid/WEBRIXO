import { useEffect, useRef } from "react";
import type { Project } from "./data";
import { prefersReducedMotion } from "./motion";

/**
 * A "scroll video" without a video: the visitor scrolls the camera down a
 * corridor of website panes. Everything is generated at runtime (canvas
 * textures), so there are no media assets to load and it stays sharp on any
 * screen. `progress` is a ref updated by the hero's ScrollTrigger.
 */
export default function HeroScene({ projects, progress, active }: {
  projects: Project[];
  progress: React.MutableRefObject<number>;
  active: React.MutableRefObject<boolean>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the CSS fallback gradient stays visible
      }
      const isMobile = window.matchMedia("(max-width: 48rem)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 4, 30);
      const camera = new THREE.PerspectiveCamera(isMobile ? 62 : 50, 1, 0.1, 120);

      // ── textures: one per project, drawn on canvas ──
      try { await document.fonts.load("500 48px 'Bricolage Grotesque'"); } catch { /* fallback font */ }
      const makeTexture = (p: Project) => {
        const W = 1024, H = 640, r = 28;
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const g = c.getContext("2d")!;
        const f = p.frame;
        g.beginPath(); g.roundRect(0, 0, W, H, r); g.clip();
        g.fillStyle = f.bg; g.fillRect(0, 0, W, H);
        // soft accent glow
        const rg = g.createRadialGradient(W * 0.78, H * 0.28, 10, W * 0.78, H * 0.28, W * 0.6);
        rg.addColorStop(0, f.accent + "55"); rg.addColorStop(1, f.accent + "00");
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        const font = (px: number, w = 500, serif = false) => `${w} ${px}px ${serif ? "Georgia, serif" : "'Bricolage Grotesque', system-ui, sans-serif"}`;
        // nav
        g.fillStyle = f.ink; g.font = font(26, 600); g.textBaseline = "middle";
        g.fillText(p.name, 48, 48);
        g.globalAlpha = 0.6; g.font = font(24, 400);
        let x = 48 + g.measureText(p.name).width + 60;
        f.nav.forEach(n => { g.fillText(n, x, 48); x += g.measureText(n).width + 36; });
        g.globalAlpha = 1;
        // pill
        g.font = font(22, 500);
        const pw = g.measureText(f.cta).width + 44;
        g.fillStyle = f.accent; g.beginPath(); g.roundRect(W - 48 - pw, 30, pw, 36, 18); g.fill();
        g.fillStyle = f.accentInk ?? "#fff"; g.fillText(f.cta, W - 48 - pw + 22, 48);
        // rule
        g.fillStyle = f.ink; g.globalAlpha = 0.12; g.fillRect(0, 84, W, 2); g.globalAlpha = 1;
        // title
        g.fillStyle = f.ink; g.font = font(f.serif ? 78 : 74, f.serif ? 400 : 500, f.serif);
        g.textBaseline = "alphabetic";
        const words = f.title.split(" "); let line = "", ty = 210; const lines: string[] = [];
        words.forEach(w => { const t = line ? line + " " + w : w; if (g.measureText(t).width > W - 96 && line) { lines.push(line); line = w; } else line = t; });
        lines.push(line);
        lines.forEach(l => { g.fillText(l, 48, ty); ty += 82; });
        g.globalAlpha = 0.65; g.font = font(28, 400); g.fillText(f.sub, 48, ty + 24); g.globalAlpha = 1;
        // cards
        const cy = H - 190, cw = (W - 96 - 40) / 3;
        for (let i = 0; i < 3; i++) {
          g.fillStyle = i === 1 ? f.accent : f.ink; g.globalAlpha = i === 1 ? 1 : 0.08;
          g.beginPath(); g.roundRect(48 + i * (cw + 20), cy, cw, 150, 16); g.fill();
          g.globalAlpha = i === 1 ? 0.55 : 0.3; g.fillStyle = i === 1 ? "#fff" : f.ink;
          g.beginPath(); g.roundRect(48 + i * (cw + 20) + 20, cy + 112, cw * 0.45, 8, 4); g.fill();
        }
        g.globalAlpha = 1;
        // browser frame edge
        g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; g.beginPath(); g.roundRect(1, 1, W - 2, H - 2, r); g.stroke();
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tex;
      };
      const textures = projects.map(makeTexture);

      // ── panes along a corridor ──
      const COUNT = isMobile ? 14 : 20, STEP = 2.7;
      const geo = new THREE.PlaneGeometry(3.2, 2);
      const panes: { mesh: InstanceType<typeof THREE.Mesh>; mat: InstanceType<typeof THREE.MeshBasicMaterial>; baseY: number; seed: number }[] = [];
      const rnd = (i: number) => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); };
      for (let i = 0; i < COUNT; i++) {
        const mat = new THREE.MeshBasicMaterial({ map: textures[i % textures.length], transparent: true, opacity: 1, side: THREE.DoubleSide, toneMapped: false });
        const mesh = new THREE.Mesh(geo, mat);
        const side = i % 2 === 0 ? -1 : 1;
        const lateral = (isMobile ? 1.7 : 2.6) + rnd(i) * 0.9 + (i < 2 ? 0.8 : 0);
        const scale = 0.75 + rnd(i + 7) * 0.5;
        mesh.position.set(side * lateral, (rnd(i + 3) - 0.5) * 1.6, -i * STEP);
        mesh.rotation.y = side * (0.55 + rnd(i + 11) * 0.25);
        mesh.rotation.z = (rnd(i + 5) - 0.5) * 0.08;
        mesh.scale.setScalar(scale);
        scene.add(mesh);
        panes.push({ mesh, mat, baseY: mesh.position.y, seed: rnd(i + 9) * Math.PI * 2 });
      }
      // faint guide lines on the corridor floor/ceiling for a sense of speed
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 4), new THREE.Vector3(0, 0, -COUNT * STEP - 10)]);
      [[-4.5, -2.6], [4.5, -2.6], [-4.5, 2.6], [4.5, 2.6]].forEach(([x, y]) => {
        const l = new THREE.Line(lineGeo, lineMat); l.position.set(x, y, 0); scene.add(l);
      });

      const camStart = 6.5, camEnd = -(COUNT - 1) * STEP + 3;
      const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
      window.addEventListener("mousemove", onMove, { passive: true });

      const resize = () => {
        const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(canvas);

      let raf = 0, last = performance.now(), smooth = 0;
      const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(Math.max((v - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!active.current) return;
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        smooth += (progress.current - smooth) * (1 - Math.pow(0.001, dt)); // eased scrub
        target.x += (mouse.x * 0.45 - target.x) * 0.04; target.y += (-mouse.y * 0.3 - target.y) * 0.04;
        camera.position.set(target.x, target.y, camStart + (camEnd - camStart) * smooth);
        camera.lookAt(target.x * 0.5, target.y * 0.5, camera.position.z - 10);
        const t = now / 1000;
        for (const p of panes) {
          p.mesh.position.y = p.baseY + Math.sin(t * 0.6 + p.seed) * 0.07;
          const d = camera.position.z - p.mesh.position.z; // positive when pane is ahead
          p.mat.opacity = smoothstep(0.4, 2.4, d);
          p.mesh.visible = d > 0.2;
        }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("mousemove", onMove);
        panes.forEach(p => p.mat.dispose());
        textures.forEach(tx => tx.dispose());
        geo.dispose(); lineGeo.dispose(); lineMat.dispose();
        renderer.dispose();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [projects, progress, active]);

  return <canvas ref={canvasRef} className="wx-hero__canvas" aria-hidden="true" />;
}
