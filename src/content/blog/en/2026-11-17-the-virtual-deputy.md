---
title: "The virtual deputy: a ten-year-old idea resurrected by LLMs"
description: "In 2016, the virtual deputy idea hit a wall: no access to legislative data. Ten years later, the National Assembly's open data and LLMs make the pipeline feasible: extraction, verification, comprehension questions."
pubDate: 2026-11-17
lang: en
tags: [side-project, llm, mistral, open-data]
translationKey: depute-virtuel
---

*Part 1: the story and the idea. Part 2: the technology. Two parts, two audiences, read what interests you.*

---

## Part 1: a democracy idea from ten years ago

About ten years ago I had an idea I called "the virtual deputy". Anyone could do what a member of parliament does: vote on bills, propose amendments, with one condition I still find essential: **prove you have read and understood the text before debating it**. Each participant had to write a few questions about the bill and answer the others' questions. Peer validation of understanding.

The idea was never about monetization. It was a democracy idea: you can only debate what you understand.

We gave up for a very concrete reason: back then, automatically extracting bills and amendments was a nightmare. No usable open data, fragile scraping, documents impossible to find. The core of the product was technically unmanageable for a small team.

The idea survived several reincarnations (training, books, quiz games), all commercial failures for other reasons. The lesson I take from it: **distribution before product**.

### Why this idea comes back now

Two things changed.

**First change: the technical blocker is gone.** The French National Assembly now publishes everything as open data, in XML and JSON: bills, all amendments by text and by reading, legislative files, debates. What took weeks of fragile scraping in 2016 now downloads in minutes.

**Second change: LLMs.** In 2016, "understanding a bill" was for humans only. Today a LLM extracts, structures, summarizes and generates comprehension questions about a bill. The peer-validation mechanism I had imagined can be AI-assisted: comprehension questions on each article, grading of the answers.

### What I am building (and not building)

Important clarification: I am not rebuilding the participatory democracy platform. No accounts, no votes, no moderation. **One brick, demonstrated end to end**: a pipeline that extracts and verifies legislative documents, with comprehension-question generation as the final brick.

It is a portfolio project before being a civic one. I am a senior developer specializing in LLM integration, and I would rather demonstrate one solid brick than a sloppy platform. Guaranteed political neutrality: the pipeline extracts and structures, it never takes a position.

---

## Part 2: the technology

### The pipeline

1. **Ingestion**: download the Assembly's open data (XML/JSON) with local caching. A downloaded document is never downloaded again.
2. **Extraction**: LLM-based structuring of bills and amendments into JSON validated by schemas (articles, signatories, operative text, statement of reasons).
3. **Verification**: consistency rules in pure code, zero LLM. Does the article targeted by an amendment exist? Is the operative text empty? Are article numbers duplicated?
4. **RAG**: semantic search over the corpus ("which amendments touch article 7?"), via PostgreSQL and pgvector.
5. **Comprehension**: comprehension-question generation on each text, answer grading. The 2016 mechanism, AI-assisted.

### The golden rule: the LLM extracts, the code verifies

The most important architectural choice of the project, and the one I will defend in front of any client: **no business rule relies on a LLM**. The LLM is a brilliant but non-deterministic extractor; verification is pure, unit-tested, reproducible code. Each rule (R1: operative text not empty, R2: signatories present, R3: targeted article exists, etc.) is testable without a network call.

It is also my reading of the market: 2026 studies converge — only 14 to 15% of AI agent pilots reach production. What separates the projects that succeed is not the model, it is measured evaluation, observability and tests. I am building the demo like the 14%.

### The stack, and why

| Brick | Choice | Why |
| --- | --- | --- |
| Language | Python 3.12 | This is a document pipeline, not a web app; unmatched data/AI ecosystem |
| API | FastAPI | Standard, free OpenAPI output, pydantic validation everywhere |
| Main LLM | Mistral (mistral-large) | Controlled cost, EU hosting, native structured output via chat.parse |
| Secondary LLM | Anthropic Claude | Quality/cost comparison on hard extraction; the LLMProvider abstraction makes switching possible without a rewrite |
| Database | PostgreSQL + pgvector | One database for relational and vector data; no dedicated vector database to maintain |
| Containerization | Docker + docker compose | Reproducibility, including for recruiters who clone the repo |
| CI | GitHub Actions | Lint + tests on every push, nightly evaluation job |
| Bonus | MCP server | The pipeline exposed as tools, pluggable into any MCP client |

Two details that matter more than they seem: **temperature=0 everywhere** (we extract, we don't create), and **systematic caching** (an already-extracted document never goes through the LLM again: cost and reproducibility).

### The end result

- A public repo, documented in FR/EN, with an honest README: no promises, metrics.
- An **evaluation set**: around 50 hand-annotated documents, and a headline number: extraction error rate, verification false positives. That number is the project's value. An AI pipeline without measured evaluation is just a demo.
- A 3-minute filmed demo: a real bill, its amendments extracted and verified, the comprehension quiz.
- Two pilot corpora: the "working on May 1st" bill (chosen for its neutrality and its multiple readings, which feed the consistency checks) and the "UK-trained doctors before Brexit" bill (full cycle up to enactment), to show the pipeline is corpus-agnostic.

### What I am learning along the way

The 2016 idea failed on a data-access problem. The 2026 one will fail if it neglects reliability. LLMs have not changed what I want to do; they have changed what is feasible. The proof is this pipeline.

*Code on GitHub: [github.com/OnEnApprendDesChoses/depute-virtuel](https://github.com/OnEnApprendDesChoses/depute-virtuel)*
