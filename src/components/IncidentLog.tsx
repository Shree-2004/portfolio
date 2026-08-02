"use client";

import { INCIDENTS } from "@/lib/data";
import { useInView } from "@/hooks/useInView";

export default function IncidentLog() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="incidents">
      <div className="section-title">
        <h2>Incident Log</h2>
        <span>found by AgentSentinel, my own eval harness</span>
      </div>
      <div className={`incident-list reveal ${inView ? "in" : ""}`} ref={ref}>
        {INCIDENTS.map((inc) => (
          <div className="incident-row" key={inc.id}>
            <div className="incident-id">{inc.id}</div>
            <div className="incident-body">
              <strong>{inc.title}</strong>
              <span className="src">{inc.source}</span>
              <p>{inc.body}</p>
            </div>
            <div className={`incident-status ${inc.status}`}>{inc.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
