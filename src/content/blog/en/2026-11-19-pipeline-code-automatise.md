---
title: "Automating my code pipeline: end-to-end senior AI code review"
description: "Writing, reviewing like a senior, testing, pushing: how I automated the entire contribution cycle on a modern Python project, with AGENTS.md, pre-commit, GitHub Actions, CodeRabbit, and an agent that fixes reviews overnight."
pubDate: 2026-11-19
lang: en
tags: [ai, devops, github, review, agents]
translationKey: pipeline-code-automatise
---

*This post is about how I set up, on my "virtual deputy" project, a fully automated write → review → test → push cycle, where code review is done by an AI that behaves like a real senior: it doesn't nitpick style, it catches real problems. And a second agent fixes the comments while I sleep.*

## The origin story, or the lesson of the phantom commit

It all started with an incident. I asked a coding agent (Mistral Code) to prepare my project on GitHub. The result: it confidently pushed a "voting app in Node.js with simulated AI" that had nothing to do with my actual project — a legislative data extraction pipeline in Python. My project existed in my head and in my notes, not in its.

The lesson: **a coding agent without context isn't a junior developer to train, it's a very fast senior with total amnesia.** You don't give it instructions, you give it a frame of reference.

Everything that follows grew from that: the context file first, then automated review, then the agent that processes reviews, each brick building on the previous one.

## In plain language: how the code writes itself (and writes itself well)

What we built looks like a small assembly line where I now only hold two stations: at the start (the decisions) and at the end (the final check).

### Step 1 — Writing: the "context" file that changes everything

Before any automation, I placed a file called AGENTS.md at the repo root. Its role is simple: any coding agent arriving on the project must read it before touching code. The file describes what the project is (a portfolio demo of legislative document extraction, not a voting platform), the mandatory tech stack, the code layout, testing conventions, and above all a list of forbidden things — no HTML scraping, no user accounts, no reinventing the project.

Concretely, this file is the only genuinely human, non-automatable work in the pipeline. I describe my intent there, and everything else aligns with it. Since it exists, no more "phantom apps" land on the main branch.

### Step 2 — Controlling locally: the checks before every commit

Second brick: a small tool called pre-commit that blocks a commit if the code violates quality or security rules. It's local, on my machine, and takes two seconds. It checks formatting, a few hygiene rules, and above all that I haven't left an API key lying around in a file.

The point: those errors used to reach review — whether a human one (someone's time) or an AI one (error budget). Now they never even reach the repo.

### Step 3 — Testing and building: the checks on GitHub

Every time a change proposal (a PR) is opened, GitHub automatically runs a battery of checks in a clean environment, independent of my machine. What passes on my machine must pass anywhere. These checks control style quality, run all the tests, build the Docker image (proving the project can ship), and scan the PR's entire commit history to make sure no secret slipped in anywhere.

### Step 4 — Reviewing: the AI senior who comments on every PR

This is the heart of the article. I installed CodeRabbit, an AI reviewer that plugs into GitHub and reads every PR like a good senior would. A good senior isn't someone who rants about whitespace: it's someone who looks at intent, detects real logic and security problems, and points precisely at what's broken.

The most interesting discovery: an AI reviewer without rules quickly becomes generic and annoying (lots of noise, alert fatigue). So I wrote my review standards — blocking vs. acceptable — and wired them into its configuration. Result: it follows my rules, and since everything lives in the repo, quality is part of the project just like the code. My first trial was convincing: the review surfaced three real problems (a missed configuration wiring, a gap in a security scan, a version divergence between two tools). Two were fixed by the agent in the next step.

### Step 5 — Fixing: the agent that processes reviews overnight

Last brick, the most satisfying one. A scheduled task runs every morning: it reads the AI reviewer's comments on open PRs, checks each one against my standards (an AI review also produces false positives), prepares the fixes, pushes them to the relevant branch, and replies in the discussion threads explaining what was fixed or refused.

With strict guardrails: never merge, never push to the main branch, never touch secrets. In the morning, all I have left is a summary: fixed, rejected, to re-read.

### What's left for me (and that's on purpose)

My station now: opening PRs (design decisions), reviewing the morning agent's fixes, merging, and keeping the context file up to date. Everything mechanical (checking, fixing style, documenting fixes) goes to the machine. What remains human is intent and final judgment. It's not less quality: it's the same quality, concentrated on the moments where my brain is actually useful.

## The technical version: the stack, brick by brick

For those who want to reproduce this. My project: a Python/FastAPI pipeline (LLM extraction of open-data legislative documents), public repo on GitHub.

### The project's foundation

- **Python 3.12 + uv**: fast, reproducible dependency management (`uv.lock` committed, everyone has exactly the same versions).
- **FastAPI + pydantic v2**: the API and strict validation of model outputs. In my pipeline, an LLM output that doesn't pass pydantic validation doesn't exist: it's refused at the border, never left circulating as a sloppy dict.
- **Docker**: the project runs in a container, including in CI.

### The automation pipeline bricks

**1. AGENTS.md, the context contract.** A Markdown file at the repo root, a format that has become a convention understood by coding agents (Mistral Code, Copilot, Claude Code read it). Contents: project scope, mandatory stack, layout, exact commands to build, lint and test, contribution rules (branch + PR mandatory, non-regression test on real fixtures for any LLM prompt change). Budget half a day to write it well, then ten minutes of maintenance as conventions evolve.

**2. pre-commit, local hygiene.** A Git hook manager that runs checks on every `git commit` and refuses the commit if something is off:

- **ruff** (lint + format): the modern Python standard, near-instant, configured in `pyproject.toml`. A detail that matters: the local hook version must be pinned to the same version as the CI — exactly what my AI review flagged (two ruff versions could diverge on some rules). Fixed by aligning versions.
- **gitleaks**: a secrets scanner (API keys, tokens) on what's being committed. Zero tolerance: a secret pushed to a public repo is a permanent leak, Git history remembers it forever.
- Hygiene hooks: trailing whitespace, valid YAML, forgotten merge conflicts, oversized files.

**3. GitHub Actions, the CI.** Two workflows versioned in `.github/workflows/`:

- `ci.yml` (every PR and push to main): dependency install via uv, ruff lint on `src`/`tests`/`eval`, pytest tests, and **mypy** for type checking. Honest detail: mypy isn't yet a dev-dependency of the project, so the job runs in "advisory" mode (`continue-on-error: true`) — it reports problems without blocking the merge. Once mypy is properly integrated, removing that single line makes it blocking. That's exactly the kind of progressive transition a well-designed CI allows.
- `quality.yml` (complementary): **Docker image build** (if the Dockerfile breaks, the PR doesn't pass) and **Gitleaks secrets scan over the PR's full commit range**. I had first used the official GitHub action, but the AI review flagged that it only scans the first 30 commits of a PR by default. Fixed: I now run the pinned official Docker image (`v8.24.3`) over the `base.sha..head.sha` range, plus a snapshot scan on main pushes. A real gap caught by a review — worth the detour.

**4. CodeRabbit, the senior AI reviewer.** A GitHub application that installs from their website in two minutes. **Free for public repos** (paid plans only cover private repos). What makes the difference between "noisy gadget" and "useful review" is customization:

- `.coderabbit.yaml`: "assertive" profile, French language, excluded paths (`uv.lock`, eval reports), and above all **per-directory instructions** — for example: "if a PR introduces an LLM call in the deterministic verification module, refuse it" or "a prompt changed without a golden test is blocking".
- `.github/review/code-review.md`: my review standards (blocking vs. worth flagging), wired via `knowledge_base.code_guidelines` with `applyTo: "**/*"` so they apply to the whole repository. That's what turns a generic review into a review that understands *this* project.

Field advice: run the AI review in "advisory" mode first (it comments, it doesn't block), while you filter false positives, and only then make it required via branch protection.

**5. The morning agent, automated review responses.** Every morning, a scheduled task (in my case, Vibe running a scheduled task, with GitHub API access):

1. Lists open PRs via the GitHub API.
2. Fetches unresolved comments from the CodeRabbit bot.
3. Reads AGENTS.md and the standards file to arbitrate: real problem or false positive?
4. Pushes fixes to the PR branch (a single `fix(review): …` commit), replies in each thread explaining the fix or the refusal.
5. Writes a summary: fixed, rejected, to re-read.

Guardrails hard-coded in the agent's prompt: no merging, no pushing to main, no touching secrets, and false-positive arbitration based on the repo's own files — the agent has an arbiter, not just its intuition.

**6. Branch protection, the final lock.** Done manually on GitHub: the main branch refuses direct pushes, requires a PR and all CI checks to pass. Even a hurried human can no longer bypass the pipeline.

## The result

The full cycle, end to end:

```text
Coding agent (reads AGENTS.md)
  → branch + PR
  → local pre-commit (ruff, gitleaks)
  → GitHub Actions (ruff, pytest, mypy, docker build, secrets scan)
  → CodeRabbit senior review
  → morning agent: fixes or rejects each comment
  → I review, I merge
  (and if a check fails: back to the coding agent)
```

Three takeaways:

1. **Context before tooling.** AGENTS.md, written first, has more impact on generated code quality than any review tool. An agent that knows what to build produces fewer bugs than a reviewer has to catch.
2. **Quality must live in the repo.** Review standards, reviewer configuration, CI workflows: everything is versioned with the code. Anyone who clones the repo gets the quality with it.
3. **AI review is excellent, provided you frame it.** On my first two PRs, it found four real problems and zero style nitpicks. But only because its rules are mine, written in black and white.

Next step: finishing the annotated evaluation set (~50 documents) to measure the LLM pipeline's error rate, and enabling branch protection. And after that? An article on how to get the agent to write unit tests without theater.

*This setup is live on the repo of my "virtual deputy" project (extraction and verification of French bills via the French National Assembly's open data). All the configuration is visible in the repo, feel free to steal the files. If you try this kind of pipeline on your own project, I'm curious what your AI reviewer catches — and what it misses.*
