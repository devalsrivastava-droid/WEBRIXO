import { useEffect, useRef } from "react";
import type { Project } from "./data";
import { prefersReducedMotion } from "./motion";

/**
 * One continuous hero in two movements.
 *
 * First: the camera flies down a corridor of the concept builds, so the work
 * is the first thing a visitor sees.
 * Then: the corridor dissolves into a field of points that gathers into a
 * lattice, twists and resolves — the structure underneath every one of them.
 *
 * Both live in one scene with one renderer and cross-fade across the midpoint,
 * so it reads as a single move rather than two effects stitched together.
 * Everything is generated at runtime — no textures or models to download.
 */

const SPLIT = 0.60;   // where the corridor hands over to the particle field
const FADE = 0.10;    // how long the two overlap during the handover

type Shape = (i: number, n: number, out: Float32Array, o: number) => void;

function rnd(seed: number) {
  const s = Math.sin(seed * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

const spiral: Shape = (i, n, out, o) => {
  const t = i / n, arm = i % 3;
  const angle = t * 9 + (arm * Math.PI * 2) / 3;
  const radius = 0.35 + t * 3.4 + rnd(i) * 0.5;
  const spread = (1 - t) * 0.9;
  out[o] = Math.cos(angle) * radius + (rnd(i + 1) - 0.5) * spread;
  out[o + 1] = (rnd(i + 2) - 0.5) * (0.5 + t * 0.6);
  out[o + 2] = Math.sin(angle) * radius + (rnd(i + 3) - 0.5) * spread;
};

const sphere: Shape = (i, n, out, o) => {
  const k = i + 0.5;
  const phi = Math.acos(1 - (2 * k) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * k;
  const r = 2.1;
  out[o] = Math.cos(theta) * Math.sin(phi) * r;
  out[o + 1] = Math.cos(phi) * r;
  out[o + 2] = Math.sin(theta) * Math.sin(phi) * r;
};

const knot: Shape = (i, n, out, o) => {
  const t = (i / n) * Math.PI * 2;
  const p = 2, q = 3, s = 0.72;
  const r = 2 + Math.cos(q * t);
  const j = 0.16;
  out[o] = r * Math.cos(p * t) * s + (rnd(i) - 0.5) * j;
  out[o + 1] = Math.sin(q * t) * s + (rnd(i + 1) - 0.5) * j;
  out[o + 2] = r * Math.sin(p * t) * s + (rnd(i + 2) - 0.5) * j;
};

const ring: Shape = (i, n, out, o) => {
  const t = (i / n) * Math.PI * 2;
  const r = 2.3 + (rnd(i) - 0.5) * 0.28;
  out[o] = Math.cos(t) * r;
  out[o + 1] = (rnd(i + 5) - 0.5) * 0.32;
  out[o + 2] = Math.sin(t) * r;
};

const star: Shape = (i, n, out, o) => {
  const t = rnd(i) * Math.PI * 2;
  const p = Math.acos(2 * rnd(i + 7) - 1);
  const roll = rnd(i + 11);
  let r: number;
  if (roll < 0.72) r = Math.pow(rnd(i + 3), 2.2) * 0.55;
  else if (roll < 0.9) r = 0.55 + rnd(i + 4) * 0.9;
  else r = 1.4 + Math.pow(rnd(i + 9), 0.6) * 2.4;
  out[o] = Math.cos(t) * Math.sin(p) * r;
  out[o + 1] = Math.cos(p) * r;
  out[o + 2] = Math.sin(t) * Math.sin(p) * r;
};

const SHAPES: Shape[] = [spiral, sphere, knot, ring, star];

export default function HeroCombined({ projects, progress, active }: {
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
      } catch { return; }

      const isMobile = window.matchMedia("(max-width: 48rem)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(isMobile ? 62 : 50, 1, 0.1, 120);

      /* ── Part one: the particle field ─────────────────────────────────── */
      const COUNT = isMobile ? 2600 : 7000;
      const targets = SHAPES.map(fn => {
        const arr = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) fn(i, COUNT, arr, i * 3);
        return arr;
      });

      const positions = new Float32Array(COUNT * 3);
      positions.set(targets[0]);
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const sizes = new Float32Array(COUNT), tints = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        const bright = rnd(i + 21) > 0.94;
        sizes[i] = bright ? 2.6 + rnd(i) * 2 : 0.7 + rnd(i + 2) * 1.1;
        tints[i] = bright ? 1 : 0;
      }
      pGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      pGeo.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

      const pMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: renderer.getPixelRatio() },
          uWarm: { value: new THREE.Color(0xd4884b) },
          uCool: { value: new THREE.Color(0xf3f1ec) },
          uOpacity: { value: 1 },
        },
        vertexShader: `
          attribute float aSize; attribute float aTint;
          uniform float uPixelRatio;
          varying float vTint; varying float vFade;
          void main() {
            vTint = aTint;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            vFade = clamp(1.0 - (-mv.z - 2.0) / 12.0, 0.15, 1.0);
            gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
          }`,
        fragmentShader: `
          uniform vec3 uWarm; uniform vec3 uCool; uniform float uOpacity;
          varying float vTint; varying float vFade;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(mix(uCool, uWarm, vTint), a * vFade * uOpacity);
          }`,
      });

      const points = new THREE.Points(pGeo, pMat);
      const field = new THREE.Group();
      field.add(points);
      scene.add(field);

      const PAIRS = isMobile ? 260 : 700;
      const lineIdx: number[] = [];
      for (let n = 0; n < PAIRS; n++) {
        const a = Math.floor(rnd(n + 31) * COUNT);
        let best = -1, bestD = Infinity;
        for (let s = 0; s < 12; s++) {
          const b = Math.floor(rnd(n * 13 + s + 3) * COUNT);
          if (b === a) continue;
          const dx = targets[1][a * 3] - targets[1][b * 3];
          const dy = targets[1][a * 3 + 1] - targets[1][b * 3 + 1];
          const dz = targets[1][a * 3 + 2] - targets[1][b * 3 + 2];
          const d = dx * dx + dy * dy + dz * dz;
          if (d < bestD) { bestD = d; best = b; }
        }
        if (best >= 0) lineIdx.push(a, best);
      }
      const linePos = new Float32Array(lineIdx.length * 3);
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lMat = new THREE.LineBasicMaterial({ color: 0xf3f1ec, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false });
      const lines = new THREE.LineSegments(lGeo, lMat);
      field.add(lines);

      /* ── Part two: the corridor of concept builds ─────────────────────── */
      try { await document.fonts.load("500 48px 'Bricolage Grotesque'"); } catch { /* fallback font */ }

      const makeTexture = (p: Project) => {
        const W = 1024, H = 640, r = 28;
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const g = c.getContext("2d")!;
        const f = p.frame;
        g.beginPath(); g.roundRect(0, 0, W, H, r); g.clip();
        g.fillStyle = f.bg; g.fillRect(0, 0, W, H);
        const rg = g.createRadialGradient(W * 0.78, H * 0.28, 10, W * 0.78, H * 0.28, W * 0.6);
        rg.addColorStop(0, f.accent + "55"); rg.addColorStop(1, f.accent + "00");
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        const font = (px: number, w = 500, serif = false) => `${w} ${px}px ${serif ? "Georgia, serif" : "'Bricolage Grotesque', system-ui, sans-serif"}`;
        g.fillStyle = f.ink; g.font = font(26, 600); g.textBaseline = "middle";
        g.fillText(p.name, 48, 48);
        g.globalAlpha = 0.6; g.font = font(24, 400);
        let x = 48 + g.measureText(p.name).width + 60;
        f.nav.forEach(n => { g.fillText(n, x, 48); x += g.measureText(n).width + 36; });
        g.globalAlpha = 1;
        g.font = font(22, 500);
        const pw = g.measureText(f.cta).width + 44;
        g.fillStyle = f.accent; g.beginPath(); g.roundRect(W - 48 - pw, 30, pw, 36, 18); g.fill();
        g.fillStyle = f.accentInk ?? "#fff"; g.fillText(f.cta, W - 48 - pw + 22, 48);
        g.fillStyle = f.ink; g.globalAlpha = 0.12; g.fillRect(0, 84, W, 2); g.globalAlpha = 1;
        g.fillStyle = f.ink; g.font = font(f.serif ? 78 : 74, f.serif ? 400 : 500, f.serif);
        g.textBaseline = "alphabetic";
        const words = f.title.split(" "); let line = "", ty = 210; const ls: string[] = [];
        words.forEach(w => { const t = line ? line + " " + w : w; if (g.measureText(t).width > W - 96 && line) { ls.push(line); line = w; } else line = t; });
        ls.push(line);
        ls.forEach(l => { g.fillText(l, 48, ty); ty += 82; });
        g.globalAlpha = 0.65; g.font = font(28, 400); g.fillText(f.sub, 48, ty + 24); g.globalAlpha = 1;
        const cy = H - 190, cw = (W - 96 - 40) / 3;
        for (let i = 0; i < 3; i++) {
          g.fillStyle = i === 1 ? f.accent : f.ink; g.globalAlpha = i === 1 ? 1 : 0.08;
          g.beginPath(); g.roundRect(48 + i * (cw + 20), cy, cw, 150, 16); g.fill();
          g.globalAlpha = i === 1 ? 0.55 : 0.3; g.fillStyle = i === 1 ? "#fff" : f.ink;
          g.beginPath(); g.roundRect(48 + i * (cw + 20) + 20, cy + 112, cw * 0.45, 8, 4); g.fill();
        }
        g.globalAlpha = 1;
        g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; g.beginPath(); g.roundRect(1, 1, W - 2, H - 2, r); g.stroke();
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tex;
      };
      const textures = projects.map(makeTexture);

      const PANES = isMobile ? 12 : 18, STEP = 2.7;
      const paneGeo = new THREE.PlaneGeometry(3.2, 2);
      const panes: { mesh: InstanceType<typeof THREE.Mesh>; mat: InstanceType<typeof THREE.MeshBasicMaterial>; baseY: number; seed: number }[] = [];
      const corridor = new THREE.Group();
      scene.add(corridor);

      for (let i = 0; i < PANES; i++) {
        const mat = new THREE.MeshBasicMaterial({ map: textures[i % textures.length], transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false });
        const mesh = new THREE.Mesh(paneGeo, mat);
        const side = i % 2 === 0 ? -1 : 1;
        const lateral = (isMobile ? 1.7 : 2.6) + rnd(i) * 0.9 + (i < 2 ? 0.8 : 0);
        mesh.position.set(side * lateral, (rnd(i + 3) - 0.5) * 1.6, -i * STEP);
        mesh.rotation.y = side * (0.5 + rnd(i + 11) * 0.3);
        mesh.rotation.z = (rnd(i + 5) - 0.5) * 0.08;
        mesh.scale.setScalar(0.75 + rnd(i + 7) * 0.5);
        corridor.add(mesh);
        panes.push({ mesh, mat, baseY: mesh.position.y, seed: rnd(i + 9) * Math.PI * 2 });
      }

      scene.fog = new THREE.Fog(0x000000, 6, 34);

      const camStart = 6.5, camEnd = -(PANES - 1) * STEP + 3;
      const mouse = { x: 0, y: 0 }, look = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      let fieldX = 0, fieldY = 0;
      const resize = () => {
        const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        pMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        // The copy sits left on wide screens, so both layers shift right to
        // keep the headline on clean background.
        // The field sits slightly right of centre so it never sits behind the
        // headline, but the corridor stays centred — you fly straight into it.
        fieldX = w >= 1024 ? 2.4 : 0;
        fieldY = w >= 1024 ? 0.5 : 0.9;
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(canvas);

      const smoothstep = (t: number) => t * t * (3 - 2 * t);
      const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
      let raf = 0, smooth = 0, last = performance.now();

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!active.current) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        smooth += (progress.current - smooth) * (1 - Math.pow(0.004, dt));
        const t = now / 1000;

        // 0 while the corridor owns the screen, 1 once the field does.
        const handover = smoothstep(clamp01((smooth - SPLIT) / FADE));
        const corridorOn = handover < 1;
        const fieldOn = handover > 0;
        corridor.visible = corridorOn;
        field.visible = fieldOn;

        look.x += (mouse.x * 0.4 - look.x) * 0.042;
        look.y += (-mouse.y * 0.28 - look.y) * 0.042;

        // The camera keeps flying through the corridor, then holds at the end
        // so the field can assemble in front of it without a jump.
        const flight = clamp01(smooth / (SPLIT + FADE * 0.5));
        camera.position.set(look.x, look.y, camStart + (camEnd - camStart) * flight);
        camera.lookAt(look.x * 0.5, look.y * 0.5, camera.position.z - 10);

        if (corridorOn) {
          for (const p of panes) {
            p.mesh.position.y = p.baseY + Math.sin(t * 0.6 + p.seed) * 0.07;
            const d = camera.position.z - p.mesh.position.z;
            p.mat.opacity = clamp01((d - 0.4) / 2.0) * (1 - handover);
            p.mesh.visible = d > 0.2;
          }
        }

        if (fieldOn) {
          const local = clamp01((smooth - SPLIT) / (1 - SPLIT));
          const span = SHAPES.length - 1;
          const scaled = Math.min(local, 0.9999) * span;
          const idx = Math.floor(scaled);
          const mix = smoothstep(scaled - idx);
          const from = targets[idx], to = targets[Math.min(idx + 1, span)];
          const pos = pGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < COUNT; i++) {
            const o = i * 3;
            pos[o] = from[o] + (to[o] - from[o]) * mix + Math.sin(t * 0.35 + i * 0.7) * 0.035;
            pos[o + 1] = from[o + 1] + (to[o + 1] - from[o + 1]) * mix + Math.cos(t * 0.3 + i) * 0.035;
            pos[o + 2] = from[o + 2] + (to[o + 2] - from[o + 2]) * mix;
          }
          pGeo.attributes.position.needsUpdate = true;
          for (let n = 0; n < lineIdx.length; n++) {
            const src = lineIdx[n] * 3, dst = n * 3;
            linePos[dst] = pos[src]; linePos[dst + 1] = pos[src + 1]; linePos[dst + 2] = pos[src + 2];
          }
          lGeo.attributes.position.needsUpdate = true;
          lMat.opacity = (0.12 * Math.sin(clamp01(local) * Math.PI) + 0.02) * handover;
          pMat.uniforms.uOpacity.value = handover;

          // Sits in front of wherever the camera ended its flight.
          field.position.set(camera.position.x + fieldX, camera.position.y + fieldY, camera.position.z - 7);
          field.rotation.y = t * 0.045 + look.x * 0.5;
          field.rotation.x = look.y * 0.5;
          // Arrives expanded from the corridor, then settles.
          field.scale.setScalar(1 + (1 - handover) * 1.6);
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("mousemove", onMove);
        pGeo.dispose(); lGeo.dispose(); paneGeo.dispose();
        pMat.dispose(); lMat.dispose();
        panes.forEach(p => p.mat.dispose());
        textures.forEach(tx => tx.dispose());
        renderer.dispose();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [projects, progress, active]);

  return <canvas ref={canvasRef} className="wx-hero__canvas" aria-hidden="true" />;
}
