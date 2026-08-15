import CountUp from "./CountUp";
import { SCORECARD } from "@/lib/data";

interface HeroProps {
  ready: boolean;
}

export default function Hero({ ready }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true">
        <span className="glow g1" />
        <span className="glow g2" />
      </div>
      <div className="hero-grid">
        <div>
          <div className="eyebrow">
            agent_under_test <span className="k">::</span> profile
          </div>
          <h1>
            Shree Londhe
            <span className="role">AI/ML Engineer — agentic systems, RAG, and the harnesses that keep them honest</span>
          </h1>
          <p className="lede">
            I build multi-agent pipelines and retrieval systems, then build the eval suites that red-team them — because a
            demo that hasn&apos;t been tested against its own failure modes isn&apos;t finished.
          </p>
          <div className="cta-row">
            <a className="btn solid" href="#cases">
              Inspect test cases ↓
            </a>
            <a className="btn ghost" href="/Shree_Londhe_Resume.pdf" target="_blank" rel="noopener">
              View resume.pdf
            </a>
          </div>
        </div>
        <div className="score-panel">
          <div className="head">
            <span>Aggregate Scorecard</span>
            <b>PASS</b>
          </div>
          {SCORECARD.map((row) => (
            <div className="score-row" key={row.label}>
              <div className="lbl">
                {row.label} <CountUp target={row.target} suffix={row.suffix} trigger={ready} />
              </div>
              <div className="meter">
                <i style={{ width: ready ? `${row.target}%` : 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
