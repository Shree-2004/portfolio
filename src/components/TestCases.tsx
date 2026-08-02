import { PROJECTS } from "@/lib/data";
import ProjectCard from "./ProjectCard";

interface TestCasesProps {
  onOpen: (key: string) => void;
}

export default function TestCases({ onOpen }: TestCasesProps) {
  return (
    <section className="cases" id="cases">
      <div className="section-title">
        <h2>Test Cases</h2>
        <span>{PROJECTS.length} of 12 projects · click a card for the full case</span>
      </div>
      <div className="case-grid">
        {PROJECTS.map((p) => (
          <ProjectCard project={p} key={p.key} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
