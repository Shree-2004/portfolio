"use client";

import { useState } from "react";
import AmbientBackground from "@/components/AmbientBackground";
import BootSequence from "@/components/BootSequence";
import Topbar from "@/components/Topbar";
import Hero from "@/components/Hero";
import QueryBar from "@/components/QueryBar";
import TestCases from "@/components/TestCases";
import IncidentLog from "@/components/IncidentLog";
import SkillCoverage from "@/components/SkillCoverage";
import RunSummary from "@/components/RunSummary";
import Footer from "@/components/Footer";
import ProjectModal from "@/components/ProjectModal";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [openProject, setOpenProject] = useState<string | null>(null);

  return (
    <div className={`page ${booted ? "revealed" : "pre-reveal"}`}>
      <AmbientBackground />
      <BootSequence onDone={() => setBooted(true)} />

      <div className="page-content">
        <Topbar />
        <div className="wrap">
          <Hero ready={booted} />
          <QueryBar />
          <TestCases onOpen={setOpenProject} />
          <IncidentLog />
          <SkillCoverage />
          <RunSummary />
          <Footer />
        </div>
      </div>

      <ProjectModal projectKey={openProject} onClose={() => setOpenProject(null)} />
    </div>
  );
}
