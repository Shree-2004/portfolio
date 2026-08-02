"use client";

import { useRef, useState, type MouseEvent } from "react";
import type { Project } from "@/lib/data";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProjectCardProps {
  project: Project;
  onOpen: (key: string) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [traceOpen, setTraceOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  function setRefs(el: HTMLDivElement | null) {
    cardRef.current = el;
    ref.current = el;
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest(".case-links") || target.closest(".trace-wrap")) return;
    onOpen(project.key);
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `translateY(-3px) perspective(700px) rotateY(${px * 3}deg) rotateX(${py * -3}deg)`;
  }

  function handleMouseLeave() {
    if (cardRef.current) cardRef.current.style.transform = "";
  }

  const totalSeconds = project.latency?.segments.reduce((s, seg) => s + seg.seconds, 0) ?? 0;

  return (
    <div
      className={`case reveal ${inView ? "in" : ""}`}
      ref={setRefs}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project.key);
        }
      }}
    >
      <div className="case-head">
        <div>
          <div className="id">
            {project.tcId} · {project.tag}
          </div>
          <h3>{project.title}</h3>
        </div>
        <span className={`verdict ${project.verdict}`}>{project.verdictLabel}</span>
      </div>

      <p className="desc">{project.desc}</p>

      {project.confidence && (
        <div className="case-meter">
          <div className="lbl">
            {project.confidence.label} <b>{project.confidence.value}% — {project.confidence.tier}</b>
          </div>
          <div className="band-track">
            <div className="bands">
              <i />
              <i />
              <i />
            </div>
            <div className="marker" style={{ left: `${project.confidence.value}%` }} />
          </div>
        </div>
      )}

      {project.latency && (
        <div className="latency-trace">
          <div className="lbl">
            Pipeline trace <b>{project.latency.total}</b>
          </div>
          <div className="latency-track">
            {project.latency.segments.map((seg) => (
              <div
                key={seg.label}
                className="latency-seg"
                style={{
                  width: `${(seg.seconds / totalSeconds) * 100}%`,
                  background: seg.color,
                  transform: inView ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            ))}
          </div>
          <div className="latency-legend">
            {project.latency.segments.map((seg) => (
              <span key={seg.label}>
                <i style={{ background: seg.color }} />
                {seg.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="case-stats">
        {project.stats.map((s) => (
          <div key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="open-hint">▸ view flashcard</div>

      <div className="case-links">
        {project.links.map((l) => (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
            {l.label}
          </a>
        ))}
        {project.debugTrace && (
          <button
            type="button"
            aria-expanded={traceOpen}
            onClick={() => setTraceOpen((v) => !v)}
          >
            {traceOpen ? "hide log" : "debug log"}
          </button>
        )}
      </div>

      {project.debugTrace && (
        <div className={`trace-wrap ${traceOpen ? "open" : ""}`}>
          <div className="trace-inner">
            <div className="trace-panel">
              <div className="trace-title">{project.debugTrace.title}</div>
              <div>{project.debugTrace.body}</div>
              <div className="trace-diff">
                <span className="before">{project.debugTrace.before}</span>
                <span className="arrow">→</span>
                <span className="after">{project.debugTrace.after}</span>
              </div>
              <div>{project.debugTrace.note}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
