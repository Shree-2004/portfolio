"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const QUERY_TEXT = "show me projects with production-grade retrieval and self-verification";

const CHIPS = [
  "multi-agent orchestration",
  "hybrid retrieval",
  "LLM fine-tuning",
  "adversarial eval",
  "langgraph",
  "qdrant",
];

export default function QueryBar() {
  const { ref, inView } = useInView<HTMLElement>();
  const reduced = useReducedMotion();
  const [text, setText] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reduced) {
      // Reduced-motion users skip the typewriter and see the final query immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(QUERY_TEXT);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setText(QUERY_TEXT.slice(0, i));
      if (i >= QUERY_TEXT.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [inView, reduced]);

  return (
    <section className={`query-section reveal ${inView ? "in" : ""}`} ref={ref}>
      <div className="query-label">{"// retrieve by capability"}</div>
      <div className="query-bar">
        <span className="prompt-mark">query&gt;</span> <span className="qtext">{text}</span>
        <span className="cursor" />
      </div>
      <div className="chip-row">
        {CHIPS.map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}
