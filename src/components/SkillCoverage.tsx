"use client";

import { SKILLS } from "@/lib/data";
import { useInView } from "@/hooks/useInView";

export default function SkillCoverage() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="coverage">
      <div className="section-title">
        <h2>Skill Coverage</h2>
        <span>capability usage across 12 shipped projects</span>
      </div>
      <div className="coverage-legend">
        <span className="lg-core">
          <i /> core — used in most shipped work
        </span>
        <span className="lg-applied">
          <i /> applied — recurring, project-proven
        </span>
        <span className="lg-special">
          <i /> specialized — deliberate deep focus
        </span>
      </div>
      <div className={`coverage-table reveal ${inView ? "in" : ""}`} ref={ref}>
        {SKILLS.map((s) => {
          const pct = (s.count / s.total) * 100;
          return (
            <div className="coverage-row" key={s.name}>
              <div className="coverage-name">
                <span className="pkg">{s.pkg}</span>
                {s.name}
              </div>
              <div className="coverage-track">
                <div
                  className={`coverage-fill ${s.tier}`}
                  style={{ width: inView ? `${pct}%` : 0 }}
                />
              </div>
              <div className="coverage-frac">
                <b>{s.count}</b>/{s.total}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
