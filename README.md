# Portfolio — Shree Londhe

AI/ML engineer portfolio, framed as a live agent evaluation report: the page opens with a boot sequence, scores itself with the same confidence-meter language used in the actual RAG/eval projects it describes, and lets you click into any project for a flashcard (overview, stack, why it was built, challenges & lessons).

**Live:** https://portfolio-bice-nine-ekrh7ppg1i.vercel.app

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Framer Motion

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/            page.tsx, layout.tsx, globals.css
  components/     BootSequence, AmbientBackground, Hero, QueryBar, ProjectCard,
                  ProjectModal, IncidentLog, SkillCoverage, RunSummary, Footer, CountUp
  hooks/          useInView, useReducedMotion
  lib/            data.ts — project content, incidents, skills, run-summary numbers
```

Project content lives in `src/lib/data.ts` — that's the file to edit when adding or updating a project.

## Deploy

Connected to Vercel; pushes to `master` auto-deploy.
