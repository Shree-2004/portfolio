"use client";

import { useEffect, useRef } from "react";

const PHRASES = [
  "checking citation coverage... ok",
  "verifying groundedness... ok",
  "scoring latency... ok",
  "running adversarial suite... ok",
  "cross-encoder rerank... ok",
  "faithfulness check... ok",
  "hybrid retrieval bm25+dense... ok",
  "judge agreement... 100%",
  "injection resistance... ok",
  "gate: no regressions found",
];

interface Particle {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let particles: Particle[] = [];
    let rafId = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid() {
      ctx!.strokeStyle = "rgba(131,140,154,0.045)";
      ctx!.lineWidth = 1;
      const step = 34;
      for (let x = 0; x < W; x += step) {
        ctx!.beginPath();
        ctx!.moveTo(x + 0.5, 0);
        ctx!.lineTo(x + 0.5, H);
        ctx!.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx!.beginPath();
        ctx!.moveTo(0, y + 0.5);
        ctx!.lineTo(W, y + 0.5);
        ctx!.stroke();
      }
    }

    function spawn() {
      particles.push({
        text: PHRASES[Math.floor(Math.random() * PHRASES.length)],
        x: 24 + Math.random() * Math.max(1, W - 300),
        y: H + 20,
        vy: 0.1 + Math.random() * 0.08,
        life: 0,
        maxLife: 1100 + Math.random() * 500,
      });
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H);
      drawGrid();
      if (particles.length < 7 && Math.random() < 0.02) spawn();
      ctx!.font = '11px "JetBrains Mono","IBM Plex Mono",ui-monospace,monospace';
      particles = particles.filter((p) => {
        p.y -= p.vy;
        p.life++;
        const t = p.life / p.maxLife;
        const a = t < 0.15 ? t / 0.15 : t > 0.8 ? Math.max(0, (1 - t) / 0.2) : 1;
        ctx!.fillStyle = `rgba(102,131,255,${a * 0.15})`;
        ctx!.fillText(p.text, p.x, p.y);
        return p.life <= p.maxLife && p.y >= -20;
      });
      rafId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduce) {
      drawGrid();
    } else {
      frame();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} id="bgfx" aria-hidden="true" />;
}
