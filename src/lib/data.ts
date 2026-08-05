export type Verdict = "live" | "bench" | "build";

export interface ProjectStat {
  value: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface LatencySegment {
  label: string;
  seconds: number;
  color: string;
}

export interface DebugTrace {
  title: string;
  body: string;
  before: string;
  after: string;
  note: string;
}

export interface Project {
  key: string;
  tcId: string;
  tag: string;
  title: string;
  verdict: Verdict;
  verdictLabel: string;
  desc: string;
  stats: ProjectStat[];
  links: ProjectLink[];
  overview: string;
  stack: string[];
  why: string;
  challenges: string;
  confidence?: { label: string; tier: string; value: number };
  latency?: { segments: LatencySegment[]; total: string };
  debugTrace?: DebugTrace;
}

export const PROJECTS: Project[] = [
  {
    key: "sebi-rag",
    tcId: "TC-01",
    tag: "retrieval / production",
    title: "SEBI/BSE Filing RAG Analyzer",
    verdict: "bench",
    verdictLabel: "benchmarked",
    desc: "Hybrid dense + BM25 retrieval over real Indian financial filings (Reliance, TCS, Infosys), with cross-encoder reranking and a post-generation grounding check that blocks ungrounded answers.",
    stats: [
      { value: "95.6%", label: "keyword acc." },
      { value: "3,637", label: "chunks (from 31.4k)" },
      { value: "4.0", label: "citations/answer" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/SEBI-BSE-Financial-Filing-RAG-Analyzer" },
    ],
    overview:
      "A retrieval-augmented system that answers questions about real Indian financial filings (Reliance FY2025, TCS Q3FY25, Infosys Q1FY27) with exact per-page citations, combining dense embeddings with BM25 keyword search so both semantic questions and exact table lookups work.",
    stack: [
      "pdfplumber + Tesseract OCR",
      "BAAI/bge-base-en-v1.5",
      "BM25 hybrid retrieval",
      "CrossEncoder reranking",
      "Qdrant Cloud",
      "FastAPI",
      "React/Vite",
      "Docker",
      "Railway + Vercel",
    ],
    why: "Wanted to prove RAG could hold up on messy real financial documents — dense tables, OCR'd scans — instead of clean blog-post text, and validate it against a hand-labeled gold question set rather than trusting it “felt” accurate.",
    challenges:
      "The chunker had a silent sliding-window bug generating near-duplicate chunks (31,477 total). Root-caused it to a step-size error, fixed it, and added a regression test pinning chunk counts per fixture page — a good lesson in never trusting chunk counts without eyeballing samples. Also flagged an unresolved production risk: the embedding model's ~510MB memory footprint exceeds a typical 512MB free-tier ceiling.",
    confidence: { label: "Grounding confidence", tier: "High", value: 91.1 },
    debugTrace: {
      title: "// root cause: sliding-window chunker bug",
      body: "Loop condition let the window advance by less than one full step on certain page layouts, re-emitting near-duplicate chunks for the same source text.",
      before: "31,477 chunks",
      after: "3,637 chunks",
      note: "Worst case: one page produced 64 chunks before the fix, 4 after. Fixed the step logic and added a regression test pinning chunk count per fixture page.",
    },
  },
  {
    key: "agentsentinel",
    tcId: "TC-02",
    tag: "eval harness / live",
    title: "AgentSentinel",
    verdict: "live",
    verdictLabel: "live",
    desc: "Wraps any agent behind a common test interface, runs versioned adversarial prompt-injection suites, and gates CI on faithfulness and injection-resistance regressions.",
    stats: [
      { value: "5", label: "real bugs caught" },
      { value: "3", label: "agents under test" },
      { value: "CI", label: "github actions gate" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/Agentsentinel" },
      { label: "live demo", href: "https://agentsentinel-bayha9degs7vbxajzayfcj.streamlit.app" },
    ],
    overview:
      "An evaluation and red-teaming harness for LLM agents — wraps any agent behind one common interface, runs it against versioned test suites (normal, edge-case, adversarial prompt-injection), and scores faithfulness, tool-call correctness, injection-resistance, and latency.",
    stack: [
      "Python",
      "Protocol-based test interface",
      "SQLAlchemy + SQLite",
      "LLM-judge scoring (Gemini)",
      "Streamlit dashboard",
      "GitHub Actions CI",
    ],
    why: "After shipping a few agentic projects, I wanted a way to know if a change actually broke something instead of eyeballing a handful of manual prompts — CI for agent behavior, not just code.",
    challenges:
      "Calibrating the LLM-judge to agree with hand-labeled ground truth took real iteration (now 100% agreement on the labeled set). It also caught a bug in its own scorer — an exception during scoring was silently swallowed, discarding an entire run's results — a reminder that eval tooling needs its own tests too.",
    confidence: { label: "LLM-judge agreement", tier: "High", value: 100 },
  },
  {
    key: "research-assistant",
    tcId: "TC-03",
    tag: "multi-agent / langgraph",
    title: "Multi-Agent Research Assistant",
    verdict: "bench",
    verdictLabel: "benchmarked",
    desc: "4 specialized agents (Researcher, Analyst, Writer, Critic) on a shared StateGraph, with a reflection loop routing failed verification back for up to 2 self-correction passes.",
    stats: [
      { value: "8.7/10", label: "quality score" },
      { value: "18", label: "citations/run" },
      { value: "12", label: "sources found" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/Multi-Agent-Research-Assistant" },
    ],
    overview:
      "A LangGraph pipeline where 4 specialized agents (Researcher, Analyst, Writer, Critic) collaborate on shared state to turn any topic into a citation-backed report, with the Critic able to send work back for revision.",
    stack: ["LangGraph StateGraph", "Gemini 2.0 Flash", "Tavily (web search)", "ArXiv API", "Streamlit", "fpdf2", "pandas (benchmarking)"],
    why: "Wanted hands-on experience with multi-agent state management and reflection loops beyond a single-prompt chain — making agents accountable to a verification step instead of trusting the first draft.",
    challenges:
      "Getting the reflection loop to actually improve output — not loop forever or rubber-stamp — required capping it at 2 revision cycles with forced approval after that: an explicit tradeoff between quality and runaway latency/cost.",
    latency: {
      total: "23.8s end-to-end",
      segments: [
        { label: "Researcher 8.42s", seconds: 8.42, color: "var(--chart-1)" },
        { label: "Analyst 5.31s", seconds: 5.31, color: "var(--chart-2)" },
        { label: "Writer 6.17s", seconds: 6.17, color: "var(--chart-3)" },
        { label: "Critic 3.89s", seconds: 3.89, color: "var(--chart-4)" },
      ],
    },
  },
  {
    key: "finance-llm",
    tcId: "TC-04",
    tag: "fine-tuning / QLoRA",
    title: "Domain Fine-Tuned Finance LLM",
    verdict: "build",
    verdictLabel: "in progress",
    desc: "Mistral-7B-Instruct fine-tuned on Indian personal-finance data via 4-bit QLoRA on a Colab T4 — training loss 1.72 → 0.68 over 3 epochs. Rank ablation, keyword-coverage benchmark, and HF Hub deployment are scaffolded but not yet run.",
    stats: [
      { value: "4×", label: "memory reduction" },
      { value: "1.72 → 0.68", label: "training loss" },
      { value: "r=16", label: "only rank trained so far" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/Finance-llm" },
    ],
    overview:
      "Mistral-7B-Instruct fine-tuned on localized Indian personal-finance topics (SIPs, PPF, EPF, ELSS, HRA, ITR, CIBIL) so it reasons correctly about India-specific financial products a general model wouldn't know well.",
    stack: ["Mistral-7B-Instruct", "QLoRA (4-bit NF4, bitsandbytes)", "PEFT/LoRA", "MLflow (wired, not yet populated)", "Gradio"],
    why: "Wanted to go through a full fine-tuning cycle end-to-end, not just call an API — including the memory-constrained reality of training a 7B model on consumer hardware.",
    challenges:
      "Built out a systematic 3-way LoRA rank ablation (r=8/16/32) with MLflow tracking and a 50-prompt keyword-coverage benchmark script — but only r=16 has actually been trained and graded so far (loss 1.72 → 0.68 on Colab's ephemeral filesystem, so MLflow has no logged runs yet either). Deliberately not quoting an ablation or benchmark number here until r=8, r=32, and the eval script have actually been run — a planned pipeline isn't a result.",
  },
  {
    key: "self-healing-rag",
    tcId: "TC-06",
    tag: "retrieval / self-healing",
    title: "Self-Healing RAG",
    verdict: "build",
    verdictLabel: "in progress",
    desc: "A LangGraph query loop that grades its own retrieval quality and recovers from bad results — rewriting the query, then widening context — instead of answering from weak context, with a background job that re-chunks documents that keep grading low-relevance.",
    stats: [
      { value: "RRF", label: "dense + BM25 fusion" },
      { value: "2", label: "recovery strategies" },
      { value: "19/19", label: "tests passing" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/Self-Healing-RAG" },
    ],
    overview:
      "A retrieval-augmented generation system built around one idea: don't trust the first retrieval. A LangGraph state machine retrieves with hybrid dense+BM25 search fused via RRF and reranked with a cross-encoder, grades each passage's relevance, and — if nothing relevant came back — rewrites the query and widens the retrieval window before generating, verifying every answer against the passages that actually supported it. A background job watches which documents keep surfacing as low-relevance and automatically re-chunks them at a smaller size, no manual re-ingestion required.",
    stack: [
      "LangGraph state machine",
      "Qdrant (embedded)",
      "BM25 + RRF fusion",
      "sentence-transformers embeddings",
      "cross-encoder reranking",
      "Ollama (local LLM)",
      "FastAPI",
      "pytest (offline fake providers)",
    ],
    why: "Most RAG demos assume the first retrieval is good enough and just generate from it. Wanted to build the failure-handling path explicitly — grade, retry, widen, verify, give up honestly — instead of quietly hallucinating past a bad retrieval.",
    challenges:
      "The offline test suite's fake relevance grader used Jaccard similarity, which got diluted on realistic multi-sentence chunks — a passage that clearly contained the answer was scoring as 'irrelevant' just because the chunk had more unrelated words than the query had matching ones. Switched to a query-coverage metric (what fraction of the query's own words appear in the passage) instead, which isn't sensitive to passage length. Also found the healing job would crash re-chunking to a smaller size than the configured overlap — caught both by actually running the system end-to-end against a live server instead of trusting the test suite alone.",
    debugTrace: {
      title: "// root cause: length-sensitive relevance grading",
      body: "Jaccard similarity between query and passage words gets diluted as passage length grows — a passage's own unrelated vocabulary swamps the denominator even when it fully contains what the query asked about.",
      before: "\"Qdrant\" query graded irrelevant against a passage that says \"Qdrant runs in embedded/local file mode\"",
      after: "Same passage correctly graded partial/relevant using query-coverage instead of Jaccard",
      note: "Caught by manually querying a live server, not by the test suite — the hand-crafted test fixtures were short enough to not expose the dilution bug.",
    },
  },
  {
    key: "ai-news",
    tcId: "TC-05",
    tag: "dashboard / scheduled LLM",
    title: "AI News Fetcher",
    verdict: "live",
    verdictLabel: "live",
    desc: "Aggregates AI/ML news from company blogs, arXiv, and Hacker News, filters and summarizes it with an LLM, and flags items touching my own stack (LangGraph, Qdrant, Gemini) as high relevance.",
    stats: [
      { value: "Daily", label: "cron digest" },
      { value: "Next.js", label: "app router" },
      { value: "SEO", label: "sitemap + OG built-in" },
    ],
    links: [
      { label: "live demo", href: "https://ai-news-hub-tawny.vercel.app" },
      { label: "source", href: "https://github.com/Shree-2004/ai-news-hub" },
    ],
    overview:
      "A dashboard that aggregates AI/ML news from company blogs, arXiv, and Hacker News, filters and summarizes it with an LLM, and flags items touching my own stack (LangGraph, Qdrant, Gemini, Mistral) as high relevance.",
    stack: ["Next.js (App Router)", "Prisma + Postgres (Neon)", "LLM summarization", "Vercel Cron", "RSS feed", "SEO: sitemap + OG image"],
    why: "Wanted a personal, filtered news feed instead of scrolling five different sources every morning — and to practice a scheduled, cost-conscious LLM pipeline instead of one that calls the API on every request.",
    challenges:
      "Added a cheap keyword pre-filter before the LLM summarization call specifically to avoid paying to summarize irrelevant articles — brought the monthly LLM spend down to a few cents.",
  },
];

export const SCORECARD = [
  { label: "Grounding rate (SEBI/BSE RAG)", target: 91.1, suffix: "%" },
  { label: "Judge agreement (AgentSentinel)", target: 100, suffix: "%" },
  { label: "Reflection-loop quality score", target: 87, suffix: "%" },
  { label: "Citation coverage", target: 97.8, suffix: "%" },
];

export const INCIDENTS = [
  {
    id: "INC-01",
    title: "Adversarial prompt injection",
    source: "RAG AI CHATBOT",
    body: "Red-team suite planted a poisoned document with a hidden “ignore all previous instructions” payload — it ranked as the top retrieval match.",
    status: "resisted" as const,
  },
  {
    id: "INC-02",
    title: "Silent failure in the scorer itself",
    source: "AgentSentinel",
    body: "An exception during scoring was swallowed instead of raised, discarding an entire run's results without any error surfaced.",
    status: "fixed" as const,
  },
  {
    id: "INC-03",
    title: "Pipeline crash on Critic non-approval",
    source: "Multi-Agent Research Assistant",
    body: "A specific reflection-loop path crashed instead of terminating cleanly when the Critic withheld approval.",
    status: "fixed" as const,
  },
  {
    id: "INC-04",
    title: "Cross-repo dependency drift",
    source: "2 repositories",
    body: "Conflicting requirements.txt pins across two projects, caught by the harness's environment checks.",
    status: "fixed" as const,
  },
  {
    id: "INC-05",
    title: "Hardcoded, retired model ID",
    source: "2 repositories",
    body: "A deprecated Gemini model string was still hardcoded in two projects, silently at risk of breaking on the next API deprecation cycle.",
    status: "fixed" as const,
  },
];

export const SKILLS = [
  { pkg: "core.", name: "python_ml", count: 10, total: 12, tier: "core" as const },
  { pkg: "ui.", name: "streamlit_gradio_demos", count: 7, total: 12, tier: "core" as const },
  { pkg: "frontend.", name: "react_typescript", count: 5, total: 12, tier: "core" as const },
  { pkg: "retrieval.", name: "rag_vector_search", count: 4, total: 12, tier: "applied" as const },
  { pkg: "ml.", name: "pytorch_deep_learning", count: 3, total: 12, tier: "applied" as const },
  { pkg: "agents.", name: "multi_agent_orchestration", count: 3, total: 12, tier: "applied" as const },
  { pkg: "ops.", name: "docker_vercel_railway", count: 3, total: 12, tier: "applied" as const },
  { pkg: "training.", name: "qlora_fine_tuning", count: 1, total: 12, tier: "special" as const },
  { pkg: "eval.", name: "adversarial_redteam", count: 1, total: 12, tier: "special" as const },
];

export const RUN_SUMMARY = [
  { target: 12, suffix: "", label: "projects shipped" },
  { target: 2, suffix: "", label: "live public demos" },
  { target: 5, suffix: "", label: "bugs caught pre-launch" },
  { target: 95.6, suffix: "%", label: "best keyword accuracy" },
];
