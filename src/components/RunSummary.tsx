"use client";

import { RUN_SUMMARY } from "@/lib/data";
import { useInView } from "@/hooks/useInView";
import CountUp from "./CountUp";

export default function RunSummary() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="summary">
      <div className="section-title">
        <h2>Run Summary</h2>
        <span>aggregated across all test cases</span>
      </div>
      <div className={`summary-grid reveal ${inView ? "in" : ""}`} ref={ref}>
        {RUN_SUMMARY.map((s) => (
          <div className="summary-cell" key={s.label}>
            <b>
              <CountUp target={s.target} suffix={s.suffix} trigger={inView} />
            </b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
