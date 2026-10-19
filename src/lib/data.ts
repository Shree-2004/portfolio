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

export interface PipelineStage {
  label: string;
  status?: "flagged" | "active" | "planned";
  detail: string;
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
  pipeline?: PipelineStage[];
}

export const PROJECTS: Project[] = [
  {
    key: "sebi-rag",
    tcId: "TC-01",
    tag: "retrieval / live",
    title: "SEBI/BSE Filing RAG Analyzer",
    verdict: "live",
    verdictLabel: "live",
    desc: "Cited Q&A over real Indian financial filings for 13 listed companies: hybrid dense + BM25 retrieval with reranking, a tool-calling agent for comparisons and growth questions, and a verifier that traces every figure in an answer back to its source table cell.",
    stats: [
      { value: "93.5%", label: "strict accuracy (124 Qs)" },
      { value: "6/6", label: "unanswerable, refused" },
      { value: "13", label: "companies" },
    ],
    links: [
      { label: "live demo", href: "https://sebi-bse-financial-filing-rag-analy.vercel.app" },
      { label: "api docs", href: "https://finfiling-rag-api.onrender.com/docs" },
      { label: "source", href: "https://github.com/Shree-2004/SEBI-BSE-Financial-Filing-RAG-Analyzer" },
    ],
    overview:
      "A retrieval-augmented system over real SEBI/BSE filings: Reliance's FY2025 annual report, TCS Q3FY25, and Q1FY27 results for Infosys, HDFC Bank, ITC, Bharti Airtel, Sun Pharma, L&T, Maruti Suzuki, Tata Steel, NTPC, Bajaj Finance and UltraTech Cement. Reported figures, comparisons, growth and ratio questions go to a tool-calling agent that looks figures up in an extracted metrics table and computes with a calculator tool, so it never does arithmetic or unit conversion (₹ crore vs ₹ million) in its head; everything else goes through hybrid retrieval with per-page citations. Company and period are detected from the question, prior-quarter figures are read from the filing that prints them, and a period or company that isn't indexed gets a refusal instead of a guess. Deployed as a Docker API on Render's free tier plus a React frontend on Vercel.",
    stack: [
      "Docling + RapidOCR",
      "BAAI/bge-base-en-v1.5 (ONNX int8)",
      "BM25 hybrid + RRF",
      "CrossEncoder rerank (ONNX int8)",
      "Qdrant Cloud",
      "Groq gpt-oss-120b tool calling",
      "SQLite metrics table",
      "FastAPI",
      "React/Vite",
      "Docker",
      "Render + Vercel",
      "GitHub Actions CI",
    ],
    why: "Wanted to prove RAG could hold up on messy real financial documents — dense tables, scanned pages, standalone and consolidated statements side by side — and measure it against hand-verified answers instead of trusting that it “felt” accurate.",
    challenges:
      "The eval I first reported (95.6%) counted an answer correct if any expected keyword appeared, and most keyword lists repeated words from the question. Re-scored strictly, the answer had to contain the right figure: 28.9%. The cause was the PDF table parser splitting numbers across columns. Switching to Docling and adding a context line to every chunk (company, period, standalone/consolidated, page) took the original 45 questions to 86.7%, and 85.7% across 63 questions on 9 companies, same model throughout. The old grounding check passed 0% of wrong figures in a mutation test; the cell-level verifier that replaced it catches 85%. Deploying to a 512 MB free tier: PyTorch alone peaked near 1 GB, so the API now runs the same models on ONNX Runtime at int8 with the index re-embedded to match — retrieval 58/63 vs 57/63 before, peak 472 MiB in a memory-capped container. Expanding to 13 companies and 124 questions (including 6 the filings can't answer) and re-running end to end on the deployed int8 stack: 116/124 strict (93.5%). The run found real bugs on the way: OCR'd headers (“Yearended”) that silently dropped a company's prior-quarter columns, an agent that searched for a period no chunk carries, a model that read “quarter ended March 31” as the wrong fiscal quarter, and an eval runner that lost saved answers on a quota stop. Still open: 8 misses (auditor names only in scanned signature stamps, a TCS table with shifted rows), and the free tier takes ~15–20 s per answer.",
    confidence: { label: "Strict answer accuracy", tier: "High", value: 93.5 },
    pipeline: [
      {
        label: "parse",
        status: "flagged",
        detail:
          "Docling's layout + table-structure models rebuild each table with its row labels and dated column headers; RapidOCR handles scanned filings. Replaced pdfplumber, which split numbers across columns (TCS's 63,973 was indexed as “93”) — the bug a lenient metric had hidden.",
      },
      { label: "chunk", detail: "Large tables are split into row groups that repeat the caption and header; every chunk gets a context line (company | period | standalone/consolidated | page) so retrieval can tell sibling tables apart." },
      { label: "embed", detail: "bge-base-en-v1.5 on ONNX Runtime, int8 (per-channel, MatMul-only). The Qdrant index is embedded with the same int8 model, so queries and chunks share one vector space." },
      { label: "metrics table", detail: "Key figures (revenue, PBT, net profit, EPS…) extracted from every table into SQLite with period read from each column's date. Lookups vote across copies and return “ambiguous” rather than guess — 64/66 hand-verified figures correct, 0 wrong; accounting identities hold on every extracted company-period." },
      { label: "detect filters", detail: "Company and period are parsed from the question (tickers, aliases, Indian fiscal-year dates); a period that isn't indexed gets a clear message instead of an answer from the wrong quarter." },
      { label: "route", detail: "A plain rule, no extra LLM call: comparison, growth or ratio wording, 2+ companies, or a reported figure the metrics table holds goes to the agent; everything else to retrieval. Top-5 retrieval had handed the model a press-release rounding and a USD EPS where the table holds the statement cell." },
      { label: "hybrid search", detail: "Qdrant dense search and BM25 keyword search run in parallel and are merged with reciprocal rank fusion, since their raw scores aren't comparable." },
      { label: "rerank", detail: "ms-marco-MiniLM CrossEncoder (ONNX int8) re-scores the top 10, two pairs at a time — scoring all 10 at once spiked memory past the 512 MB limit." },
      { label: "generate", detail: "gpt-oss-120b on Groq writes a cited answer from the top chunks — or, on the agent path, calls lookup_metric / calculate / search_filing until it has every figure." },
      { label: "verify", detail: "Each number in the answer must match a source cell with the right row, period column and standalone/consolidated basis, and at least one must come from the row the question asks about. Agent answers are checked against the tool outputs, with one retry if a figure didn't come from a tool." },
      { label: "cite", detail: "Each figure is returned with its company, period and page." },
    ],
    debugTrace: {
      title: "// root cause: table parser split numbers, and a lenient metric hid it",
      body: "pdfplumber put column boundaries through the middle of numbers, so TCS's revenue of 63,973 was indexed as “93”. The keyword-based eval still scored 95.6%, because answers repeated words from the question.",
      before: "28.9% strict accuracy",
      after: "86.7% on the same 45 questions",
      note: "Docling parser + contextual chunk headers, same LLM. Every gold answer was re-verified against the PDF — two of the original labels were wrong and were fixed.",
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
    pipeline: [
      { label: "wrap agent", detail: "Any agent implements one Protocol (setup/run/teardown); real adapters run the target under its own venv via a subprocess JSON shim so incompatible dependency pins never collide." },
      { label: "load cases", detail: "Versioned YAML test cases are loaded and tagged normal, edge-case, or adversarial prompt-injection." },
      { label: "run suite", detail: "setup() runs once, then run() executes per case producing a normalized trace, with teardown() always firing via finally." },
      {
        label: "score traces",
        status: "flagged",
        detail:
          "A swallowed exception here — a judge API rate-limit — used to crash the whole suite and discard every already-collected result; now caught per-scorer and encoded as a scorer error instead of propagating.",
      },
      { label: "calibrate judge", detail: "Before the faithfulness judge is trusted in scoring, it's run against 6 hand-labeled (claim, context, verdict) triples — 100% agreement is earned here, not assumed." },
      { label: "aggregate + gate", detail: "Per-metric scores roll up into a scorecard, then checked against a configurable pass-rate floor." },
      { label: "persist results", detail: "Runs, traces, and scores are written to SQLite via SQLAlchemy so history survives past a single invocation." },
      { label: "regression check", detail: "Each new run is diffed against the most recent prior run for the same agent, per metric, to catch silent quality drops." },
      { label: "dashboard render", detail: "A Streamlit dashboard reads the same SQLite tables read-only across four tabs — no recomputation, pure viewer." },
      { label: "ci gate", detail: "GitHub Actions runs the gate with deterministic scorers only (no API key needed) against a cached rolling baseline, failing the build on any regression." },
    ],
  },
  {
    key: "research-assistant",
    tcId: "TC-03",
    tag: "multi-agent / langgraph",
    title: "Multi-Agent Research Assistant",
    verdict: "bench",
    verdictLabel: "benchmarked",
    desc: "5 specialized agents (Researcher, Analyst, Writer, Verifier, Critic) on a shared StateGraph — a Citation Verifier checks every cited claim against its source, and the Critic routes failed drafts back for one revision cycle by default.",
    stats: [
      { value: "0.875", label: "citation precision" },
      { value: "16", label: "cited claims checked" },
      { value: "17", label: "sources found" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/Multi-Agent-Research-Assistant" },
    ],
    overview:
      "A LangGraph pipeline where 5 specialized agents (Researcher, Analyst, Writer, Verifier, Critic) collaborate on shared state to turn any topic into a citation-backed report. The Verifier labels each cited claim SUPPORTED, PARTIAL or UNSUPPORTED against the text of the source it cites, and the Critic can send work back for revision.",
    stack: ["LangGraph StateGraph", "Gemini 2.5 Flash", "Tavily (web search)", "ArXiv API", "Streamlit", "fpdf2", "pandas (benchmarking)"],
    why: "Wanted hands-on experience with multi-agent state management and reflection loops beyond a single-prompt chain — making agents accountable to a verification step instead of trusting the first draft.",
    challenges:
      "The heuristic quality score said 10/10 and couldn't tell whether a citation was true. Adding a Citation Verifier showed the reflection loop can make things worse: in a live run the first draft's citations were 16/16 supported (precision 1.0), and the Critic-requested revision introduced one unsupported and one partial claim (0.875) — invisible to the old score. One run, not a trend, but only the verifier could have seen it. It's also the slowest stage (34–55s per draft), and the loop is capped at one revision cycle by default to bound latency and cost.",
    latency: {
      total: "242.87s end-to-end (one revision cycle triggered)",
      segments: [
        { label: "Researcher 17.7s", seconds: 17.73, color: "var(--chart-1)" },
        { label: "Analyst 28.4s", seconds: 28.43, color: "var(--chart-2)" },
        { label: "Writer 20.0s", seconds: 20.01, color: "var(--chart-3)" },
        { label: "Verifier 33.7s", seconds: 33.69, color: "var(--chart-1)" },
        { label: "Critic 9.0s", seconds: 9.02, color: "var(--chart-4)" },
        { label: "Analyst · revision 33.3s", seconds: 33.28, color: "var(--chart-2)" },
        { label: "Writer · revision 28.7s", seconds: 28.65, color: "var(--chart-3)" },
        { label: "Verifier · revision 55.2s", seconds: 55.18, color: "var(--chart-1)" },
        { label: "Critic · revision 16.9s", seconds: 16.89, color: "var(--chart-4)" },
      ],
    },
    pipeline: [
      { label: "researcher", detail: "Gemini generates 3 search queries, then Tavily web search and the ArXiv API are called per query and merged/deduped into raw sources." },
      { label: "analyst", detail: "Turns raw sources into structured findings, contradictions, and trends — and re-incorporates the critic's feedback on revision passes." },
      { label: "writer", detail: "Expands the analyst's structured notes into the full cited draft — executive summary, findings, conclusion, references." },
      {
        label: "verifier",
        status: "flagged",
        detail: "Extracts every sentence with a numeric citation and has Gemini label it against the cited source's retrieved text only; citations to nonexistent sources are marked DANGLING without a model call. Reports citation precision per draft.",
      },
      { label: "critic", detail: "Scores the draft against a 5-point checklist, with the verifier's failures as evidence; if it fails, feedback routes back to the analyst — one revision cycle at the default setting (env-configurable) before force-approval." },
    ],
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
    pipeline: [
      { label: "fetch feeds", detail: "Pulls RSS from company blogs and arXiv (cs.CL/cs.LG/cs.MA), plus Hacker News via the Algolia API, filtered to the last 48 hours — triggered by a daily Vercel Cron hit." },
      { label: "clean titles", detail: "Strips LaTeX math delimiters and backslash commands from arXiv titles so raw $...$ and \\Sigma-style text doesn't leak into the UI." },
      { label: "dedupe", detail: "Normalizes and drops repeat titles, since the same story often shows up across RSS, arXiv, and Hacker News." },
      {
        label: "keyword pre-filter",
        status: "flagged",
        detail: "A hardcoded keyword check runs before the LLM call so irrelevant items never get sent for summarization — keeps monthly spend to a few cents.",
      },
      { label: "summarize + flag", detail: "One LLM call both drops anything still irrelevant and, per item, writes a summary, assigns a category, and flags high relevance for anything touching my own stack." },
      { label: "persist", detail: "Checks for an existing row by URL before inserting, so the same story never gets summarized — or billed — twice across days." },
      { label: "dashboard render", detail: "Today's digest and the dated archive pages query Postgres directly and render server-side." },
      { label: "seo + feeds", detail: "A sitemap, a dynamic OG image, an RSS feed, and robots rules are all generated straight from the same digest data at request time." },
    ],
    challenges:
      "Added a cheap keyword pre-filter before the LLM summarization call specifically to avoid paying to summarize irrelevant articles — brought the monthly LLM spend down to a few cents.",
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
    pipeline: [
      { label: "dense search", detail: "Vector search over the embedded index returns the top semantic candidates, run as one half of a combined retrieve step." },
      { label: "bm25 search", detail: "A parallel BM25 keyword search runs alongside dense search over the same widened candidate pool." },
      { label: "rrf fuse", detail: "Reciprocal rank fusion (k=60) merges the two ranked lists into one before reranking." },
      { label: "rerank", detail: "A cross-encoder reranks the fused candidates for precision, if enabled." },
      {
        label: "grade relevance",
        status: "flagged",
        detail:
          "Length-sensitive grading bug found & fixed — Jaccard similarity divided by the union of query+passage words, diluting on long passages; swapped for query-coverage, which divides by the query's word count only.",
      },
      { label: "rewrite query", detail: "If nothing graded relevant and the rewrite budget isn't exhausted, the query is rewritten and retrieval runs again." },
      { label: "widen window", detail: "Once rewrites are exhausted, the retrieval window doubles and retrieval runs again before giving up." },
      { label: "generate", detail: "Once any passage grades relevant (or recovery is exhausted), the LLM drafts an answer from what's available." },
      { label: "verify", detail: "The generated answer is checked against the retrieved text it's supposed to be grounded in, with a caveat appended if unverified." },
      { label: "give up honestly", detail: "If rewrite and widen are both exhausted and nothing relevant turned up, a fixed \"not enough context\" message returns instead of a hallucinated answer." },
      {
        label: "self-heal rechunk",
        detail:
          "A separate background job polls which documents keep grading low-relevance across queries and automatically re-chunks them smaller once a threshold is crossed — no manual re-ingestion required.",
      },
    ],
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
    pipeline: [
      { label: "data curation", detail: "200 hand-authored India-specific instruction/response pairs (SIP, PPF, EPF, ELSS, HRA, ITR, CIBIL) — the actual training source on disk." },
      {
        label: "dataset merge",
        status: "planned",
        detail: "A script can pull in and dedupe FinQA + Finance-Alpaca from Hugging Face alongside the custom pairs — needs an input file that isn't in the repo, so it's never actually been run.",
      },
      { label: "alpaca format", detail: "Raw Q&A JSON is converted into the Instruction/Response template and written to train.jsonl." },
      { label: "4-bit qlora load", detail: "Mistral-7B-Instruct-v0.2 loads via 4-bit NF4 quantization with LoRA adapters injected into the attention and MLP layers." },
      {
        label: "train r=16",
        status: "active",
        detail:
          "The only rank actually trained — 3 epochs, loss 1.7174 → 0.9824 → 0.6772 per the real checkpoint's trainer_state.json. MLflow logging is wired in, but that run happened on Colab's ephemeral disk, so this repo's local tracking DB has nothing logged yet.",
      },
      {
        label: "rank ablate r=8/32",
        status: "planned",
        detail: "Training presets for both ranks are fully wired and ready to run in the same script — just not run yet.",
      },
      {
        label: "benchmark eval",
        status: "planned",
        detail: "A 50-prompt keyword-coverage script comparing base vs. adapter is complete, but no results file exists yet.",
      },
      {
        label: "merge + deploy",
        status: "planned",
        detail: "Merges the adapter into the base model and can push to the Hugging Face Hub — blocked on the ablation and benchmark actually running first.",
      },
    ],
    challenges:
      "Built out a systematic 3-way LoRA rank ablation (r=8/16/32) with MLflow tracking and a 50-prompt keyword-coverage benchmark script — but only r=16 has actually been trained and graded so far (loss 1.72 → 0.68 on Colab's ephemeral filesystem, so MLflow has no logged runs yet either). Deliberately not quoting an ablation or benchmark number here until r=8, r=32, and the eval script have actually been run — a planned pipeline isn't a result.",
  },
  {
    key: "agentlens",
    tcId: "TC-07",
    tag: "agent debugging / eval",
    title: "AgentLens",
    verdict: "bench",
    verdictLabel: "benchmarked",
    desc: "Diagnoses which step in a multi-step agent trajectory a failure actually traces back to, using deterministic rule checks plus an LLM judge — validated against a 10-trace hand-labeled benchmark on two judge models, then stress-tested against a live, unscripted run of a separate real agent.",
    stats: [
      { value: "0", label: "false positives (2 judge models)" },
      { value: "80%", label: "accuracy, full Groq run (24/30)" },
      { value: "10", label: "ground-truth traces" },
    ],
    links: [
      { label: "source", href: "https://github.com/Shree-2004/agentlens" },
    ],
    overview:
      "Most agent evals score the final output. AgentLens instead tries to find the exact step a multi-step agent's trajectory actually went wrong at — the upstream cause, not just the downstream symptom — using fast deterministic checks (tool-call loops, silently swallowed errors) plus an LLM judge for subtler cases, like a fact that goes stale or gets contradicted several steps before the final answer is visibly wrong.",
    stack: [
      "Python",
      "Groq + Gemini + Anthropic (multi-provider judge)",
      "Structured JSON verdict schema",
      "Rule-based static checks",
      "Hand-labeled ground-truth benchmark",
      "HTML/JS timeline viewer",
    ],
    why: "An eval that only grades the final answer can't tell a genuinely correct diagnosis from a fluent, convincing-sounding wrong one. Wanted a tool that's honest about that distinction in its own output, not just plausible-sounding — and, after building a synthetic ground-truth benchmark, wanted to know if it actually held up against a trace nobody designed for it to catch.",
    challenges:
      "Built a 10-trace hand-labeled benchmark (8 failure types + 2 clean traces). Every one of those traces was hand-authored, so I pointed the judge at a live, unscripted run of a separate real multi-agent project — and it missed a genuine contradiction 5/5 times. Root cause and fix below. A complete 30-run pass on a second judge model (Groq gpt-oss-120b) then scored 80% with zero false positives, and reading the judge's own reasoning showed why the misses clustered: it could see two claims disagree, but not an unsupported choice between options or a caveat dropped from a value. A third pass for those reached 30/30 — but it was developed against this same benchmark, so it's partly in-sample; the clean re-run with test-set examples removed from the prompt gave 11/12, and the real-trace catch still held. Still open: traces nobody here has seen.",
    debugTrace: {
      title: "// root cause: judge missed a real, unscripted contradiction",
      body: "The judge was tuned to compare facts sitting in clean, structured tool_result fields. A real contradiction from a live run — one agent stating a fact, another agent's review two steps later stating the opposite — was buried in two ~10,000-character prose blocks instead, and went uncaught across 5 straight runs — 3 on the original prompt, 2 after a prompt-only fix.",
      before: "5/5 runs missed the contradiction, even after rewording the prompt to ask for it explicitly",
      after: "Caught cleanly once claim-extraction became a required field in the judge's output schema, not just an instruction it could silently skip",
      note: "Found by testing against a live run of a separate real agent project, not a trace built for the tool to catch — the entire reason that test existed.",
    },
    pipeline: [
      { label: "trace ingest", detail: "A trace is a task description plus an ordered list of steps (reasoning / tool_call / tool_result / final_answer) — close enough to OTel's GenAI semantic conventions that real logs could be adapted in later." },
      { label: "rule checks", detail: "No LLM call: flags tool-call loops (same tool+args 3+ times), tool errors silently treated as success, and missing tool arguments." },
      {
        label: "llm judge",
        status: "flagged",
        detail: "One call, three passes: extract every concrete claim per step into a required output field, compare claims for contradictions, then check for unsupported commitments and dropped caveats. Making extraction a required field, not an instruction, is the fix that closed the real-trace miss above.",
      },
      { label: "merge", detail: "Combines rule and judge findings, preferring the earliest high-confidence one — the upstream root cause matters more than a downstream symptom of the same failure." },
      { label: "timeline viewer", detail: "Renders the diagnosis as a timeline that visually breaks at the critical step, so a 15-step trajectory's failure point is visible at a glance." },
    ],
  },
];

export const SCORECARD = [
  { label: "Strict answer accuracy (SEBI/BSE RAG)", target: 93.5, suffix: "%" },
  { label: "Judge agreement (AgentSentinel)", target: 100, suffix: "%" },
  { label: "Citation precision (Research Assistant)", target: 87.5, suffix: "%" },
  { label: "Wrong figures caught (SEBI/BSE verifier)", target: 85, suffix: "%" },
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
  {
    id: "INC-06",
    title: "Judge missed a real, unscripted contradiction",
    source: "AgentLens",
    body: "Tuned to spot contradictions in structured tool results, the LLM judge missed one buried in ~10,000 characters of prose from a live agent run, 5 times in a row — fixed by requiring claim extraction as an output field instead of an instruction.",
    status: "fixed" as const,
  },
  {
    id: "INC-07",
    title: "Eval reported 95.6% on answers with the wrong numbers",
    source: "SEBI/BSE Filing RAG",
    body: "The metric counted an answer correct if any expected keyword appeared — and keyword lists repeated words from the question. Strict scoring showed 28.9%, traced to a table parser splitting numbers across columns; now 93.5% on 124 hand-verified questions.",
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
  { target: 13, suffix: "", label: "projects shipped" },
  { target: 3, suffix: "", label: "live public demos" },
  { target: 7, suffix: "", label: "bugs caught pre-launch" },
  { target: 93.5, suffix: "%", label: "strict RAG accuracy" },
];
