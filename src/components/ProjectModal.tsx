"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS } from "@/lib/data";

interface ProjectModalProps {
  projectKey: string | null;
  initialStage?: number;
  onClose: () => void;
}

export default function ProjectModal({ projectKey, initialStage, onClose }: ProjectModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const project = PROJECTS.find((p) => p.key === projectKey) ?? null;
  const [selectedStage, setSelectedStage] = useState(0);

  useEffect(() => {
    if (project) {
      lastFocused.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      closeBtnRef.current?.focus({ preventScroll: true });
      if (initialStage !== undefined) {
        setSelectedStage(initialStage);
      } else {
        const flagged = project.pipeline?.findIndex((s) => s.status === "flagged" || s.status === "active") ?? -1;
        setSelectedStage(flagged >= 0 ? flagged : 0);
      }
    } else {
      document.body.style.overflow = "";
      lastFocused.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, initialStage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && project) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          id="modal-overlay"
          className="open"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="modal-card"
            initial={{ y: 14, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 14, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-head">
              <div>
                <div className="id">{project.tcId}</div>
                <h3>{project.title}</h3>
              </div>
              <button className="modal-close" ref={closeBtnRef} type="button" aria-label="Close" onClick={onClose}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="mlabel">{"// overview"}</div>
                <p>{project.overview}</p>
              </div>
              {project.pipeline && (
                <div className="modal-section">
                  <div className="mlabel">{"// pipeline — click a stage"}</div>
                  <div
                    className="pipeline-track large"
                    style={{ gridTemplateColumns: `repeat(${project.pipeline.length}, 1fr)` }}
                  >
                    <span className="pipeline-line" aria-hidden="true" />
                    {project.pipeline.map((stage, i) => (
                      <button
                        key={stage.label}
                        type="button"
                        className={`pipeline-stage ${stage.status ?? ""} ${selectedStage === i ? "selected" : ""}`}
                        aria-pressed={selectedStage === i}
                        onClick={() => setSelectedStage(i)}
                      >
                        <span className="pnode" />
                        <span className="plabel">{stage.label}</span>
                      </button>
                    ))}
                  </div>
                  {project.pipeline[selectedStage] && (
                    <div className={`pipeline-detail ${project.pipeline[selectedStage].status ?? ""}`}>
                      <b>{project.pipeline[selectedStage].label}</b> — {project.pipeline[selectedStage].detail}
                    </div>
                  )}
                </div>
              )}
              <div className="modal-section">
                <div className="mlabel">{"// stack"}</div>
                <div className="modal-stack">
                  {project.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <div className="mlabel">{"// why i built it"}</div>
                <p>{project.why}</p>
              </div>
              <div className="modal-section">
                <div className="mlabel">{"// challenges & lessons"}</div>
                <p>{project.challenges}</p>
              </div>
            </div>
            <div className="modal-foot">
              {project.links.map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
