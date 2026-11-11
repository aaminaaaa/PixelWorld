import { useEffect, useRef } from "react";
import "./PixelPets.css";

const SCALE = 4; // pixel size on screen
const SIZE = 12 * SCALE; // sprite is 12x12 pixels
const GROUND = 6; // gap from the bottom of the window

// o = outline, e = eye, p = pink (ears/cheeks), n = nose, b = body colour
const BASE = { o: "#3A2E2E", e: "#3A2E2E", p: "#F2A3AE", n: "#D9707F" };

const LEGS_A = ["..obo..obo..", "..ooo..ooo.."];
const LEGS_B = ["...obo.obo..", "...ooo.ooo.."];

const PETS = [
  {
    name: "cat",
    body: "#F7C9CB",
    speed: 42,
    top: [
      ".oo......oo.",
      ".opo....opo.",
      ".oooooooooo.",
      "obbbbbbbbbbo",
      "obbebbbbebbo",
      "obpbbnnbbpbo",
      ".obbbbbbbbo.",
      "..oooooooo..",
      "..obbbbbbo..",
      "..obbbbbbo..",
    ],
  },
  {
    name: "bunny",
    body: "#FFF8EF",
    speed: 56,
    top: [
      "..oo....oo..",
      "..opo..opo..",
      "..opo..opo..",
      ".oooooooooo.",
      "obbbbbbbbbbo",
      "obbebbbbebbo",
      "obpbbnnbbpbo",
      ".obbbbbbbbo.",
      "..oooooooo..",
      "..obbbbbbo..",
    ],
  },
];

function Sprite({ rows, body, cls }) {
  const colors = { ...BASE, b: body };
  return (
    <svg
      className={cls}
      viewBox="0 0 12 12"
      width={SIZE}
      height={SIZE}
      shapeRendering="crispEdges"
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={colors[c]}
            />
          ),
        ),
      )}
    </svg>
  );
}

export default function PixelPets() {
  const refs = useRef([]);

  useEffect(() => {
    const els = refs.current;
    const W = () => window.innerWidth;
    const ground = () => window.innerHeight - SIZE - GROUND;
    const rnd = (a, b) => a + Math.random() * (b - a);

    const S = PETS.map((p, i) => ({
      x: rnd(60, Math.max(120, W() - 120)),
      y: -SIZE - 20,
      vy: 0,
      dir: Math.random() < 0.5 ? -1 : 1,
      mode: "wait",
      t: 0,
      delay: 0.5 + i * 1.4, // second pet drops a moment later
      speed: p.speed,
      ft: 0,
      frame: "a",
      
    }));

    const draw = (s, el) => {
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      el.dataset.dir = s.dir;
      el.dataset.frame = s.frame;
      el.dataset.mode = s.mode;
    };

    // Respect reduced motion: just place them on the ground, no animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      S.forEach((s, i) => {
        s.y = ground();
        s.mode = "idle";
        draw(s, els[i]);
      });
      return;
    }

    let last = performance.now();
    
    let raf;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      
      const g = ground();

      S.forEach((s) => {
        if (s.mode === "wait") {
          s.delay -= dt;
          if (s.delay > 0) return;
          s.mode = "fall";
        }

        if (s.mode === "fall" || s.mode === "hop") {
          s.vy += 1500 * dt;
          s.y += s.vy * dt;
          if (s.y >= g) {
            s.y = g;
            if (s.mode === "fall" && s.vy > 300) {
              s.vy = -s.vy * 0.3; // little bounce on landing
            } else {
              s.vy = 0;
              s.mode = "idle";
              s.t = rnd(0.6, 1.4);
            }
          }
        } else {
          s.y = g;
          s.t -= dt;
          if (s.mode === "walk") {
            s.x += s.dir * s.speed * dt;
            if (s.x < 8) {
              s.x = 8;
              s.dir = 1;
            }
            const max = W() - SIZE - 8;
            if (s.x > max) {
              s.x = max;
              s.dir = -1;
            }
            s.ft += dt;
            if (s.ft > 0.18) {
              s.ft = 0;
              s.frame = s.frame === "a" ? "b" : "a";
            }
            if (s.t <= 0) {
              s.mode = "idle";
              s.frame = "a";
              s.t = rnd(0.8, 2.2);
            }
          } else if (s.t <= 0) {
            const r = Math.random();
            if (r < 0.65) {
              s.mode = "walk";
              s.dir = Math.random() < 0.5 ? -1 : 1;
              s.t = rnd(2, 5);
            } else if (r < 0.85) {
              s.mode = "hop";
              s.vy = -420;
            } else {
              s.t = rnd(1, 2.5);
            }
          }
        }
      });

      S.forEach((s, i) => {
        if (s.mode === "wait") return;
        draw(s, els[i]);
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pixel-pets" aria-hidden="true">
      {PETS.map((p, i) => (
        <div
          key={p.name}
          className="pet"
          ref={(el) => (refs.current[i] = el)}
          data-frame="a"
          data-dir="1"
          data-mode="wait"
          style={{ transform: "translate3d(-200px, -200px, 0)" }}
        >
          
          <div className="pet-flip">
            <Sprite rows={[...p.top, ...LEGS_A]} body={p.body} cls="f-a" />
            <Sprite rows={[...p.top, ...LEGS_B]} body={p.body} cls="f-b" />
          </div>
        </div>
      ))}
    </div>
  );
}
