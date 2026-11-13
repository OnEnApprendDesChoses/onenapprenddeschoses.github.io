---
title: "From “what's for dinner?” to an app: Fridge → Recipes"
description: "How my recipe-suggestion app idea came together: the idea, the prototype, and the chosen stack."
pubDate: 2026-11-11
lang: en
tags: [side-project, react, ai]
translationKey: frigo-vers-recettes
---

The idea had been lingering for a while: I love cooking, but I often lack inspiration,
and classic recipe apps start from a search box, not from my fridge.

## The real problem

“What am I having tonight with what I have?” is a daily question.
Answering it means crossing three things: what's in the fridge, the time I have,
and my tastes. No mainstream app does this intersection properly.

## What I want

1. **I enter what's in my fridge** (and the app remembers it)
2. **I set constraints**: available time, diet (vegetarian, gluten-free...), number of days
3. **I provide inspirations**: sites, chefs, recipes I love
4. **The app suggests** recipes using my ingredients, in a style that suits me
5. **I rate what I cook**, and the app remembers

## The prototype

First step: an interactive mockup to validate the journey, before any serious code.
Done in a few hours, with the full flow: fridge → constraints → suggestions → rating.

The click moment: the suggestions page has to be earned. You fill your fridge,
tap “Find my recipes”, and suggestions arrive ranked by what you already own.

## The stack

- **Front**: Vite + React + TypeScript
- **API**: Express + TypeScript + SQLite
- **Engine**: an LLM (Mistral API) receiving fridge + constraints + excerpts from my
  imported recipes, improvising in the style I like — a small homemade RAG

Importing recipes from websites (Marmiton & co.) leverages the schema.org markup those
sites already publish: no brittle scraping needed for most of them.

## What's next

The starter runs. Next: plug in a real API key, deploy to Vercel,
and import my first recipe collections. You learn things, and I'll write about it here.

> **Update (November 13)**: the Vercel plan is off! In [how I chose my stack](/en/blog/2026-11-13-how-i-chose-my-stack)
> I tell the reasoning that flipped everything to a managed app on Mistral.
> And the app has been [live](/en/blog/2026-11-13-deploying-without-leaving-windows) since.
