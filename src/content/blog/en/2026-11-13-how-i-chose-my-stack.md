---
title: "How I chose my stack (or: why I gave up on Vercel along the way)"
description: "Front, API, database, LLM: the reasoning behind every brick of Fridge → Recipes, and why 'one more service' is rarely a good answer."
pubDate: 2026-11-13
lang: en
tags: [side-project, astro, mistral, github]
translationKey: comment-jai-choisi-ma-stack
---

My first post ended with a very tidy plan: Vite + Express + SQLite, deploy
on Vercel, plug in an API key, and go live. A few days later, that plan is
in the bin. Not because it was bad, but because thinking hard about each
brick made it fall, domino after domino. Here is the full reasoning,
because it's what decided everything.

## The starting point: my criteria, not the world's best technologies

A solo side project doesn't have the same needs as a team. My criteria,
in order:

1. **I must understand every brick.** What I don't understand, I can't
   debug at 11 pm.
2. **As few external services as possible.** Every extra service is one
   more thing that can break, bill, or change its pricing.
3. **The LLM engine integrated naturally.** My app has an artificial
   brain at its center; anything that simplifies connecting it is gold.

## Domino 1: the LLM API key

With a classic Express server, the Mistral key that generates recipes
lives in the host's environment variables. It works. But it means
managing the key, making sure it never leaks, understanding the host's
security configuration. Looking at the Mistral platform, I discovered
the "managed app" option: the LLM engine is native there, provided by a
small toolkit (`mistral_client`) that talks to the model without me
handling authentication in my code. Domino one: the Express API gives way
to a FastAPI API integrated into the platform.

## Domino 2: infrastructure fragmentation

The Vercel plan involved three providers: front + API on Vercel,
database on Supabase, LLM on Mistral. Three dashboards, three billing
systems, three documentations, three privacy policies. The managed app
brings the three together: front, API, and the PostgreSQL database
deploy in a single move, the database is provisioned automatically.
My planned SQLite promised simplicity; a managed Postgres I don't have
to install is just as simple, and it's already there.

## Domino 3: Next.js (or: the framework you won't impose on me)

Vercel pushes hard toward Next.js, its in-house framework, which has
become the royal road on their platform. I don't know it. Learn a
framework on top of a deployment, a database, and an LLM? Too many new
things at once, and criterion 1 sank. The managed app uses standard
bricks: FastAPI, which I know, and TanStack Start for the front.
Nothing exotic, nothing proprietary.

## And the blog, then? Astro, and the same rule

For this blog, I had a choice: Vercel would have been fine here (static
site, nothing sensitive). But the "one more service" rule applies all
the same: GitHub Pages hosts static sites for free, included in what I
already own. One less account, one less credit card. Same logic, two
contexts.

By the way, Astro: a site generator that builds static HTML pages from
my Markdown files. No server to keep running, no superfluous JavaScript
sent to the visitor, just fast pages. Content sites love it.

## The rule to remember

Vercel isn't "bad". It's an excellent host, and for many projects I
would recommend it. But for **this** project, at **this** moment, with
**my** criteria, every brick pointed elsewhere. You don't choose a stack
by collecting fashionable tools: you choose it by listing your
constraints, and listening to the ones that knock the dominoes over.
I learned things, alright.
