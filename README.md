# On en apprend des choses

Blog bilingue (FR/EN) construit avec [Astro](https://astro.build).

## Écrire un billet

Crée `src/content/blog/fr/mon-billet.md` (et `src/content/blog/en/mon-billet.md` pour la
version anglaise). Frontmatter :

```yaml
title: "Titre du billet"
description: "Un résumé d'une ligne."
pubDate: 2026-11-11
lang: fr
tags: [side-project]
translationKey: mon-billet   # identique entre FR et EN pour lier les deux versions
```

## Démarrage

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # site statique dans dist/
```

## Déploiement sur Vercel

1. Pousse ce repo sur GitHub
2. Sur [vercel.com](https://vercel.com) : « Add New Project » → choisis le repo
3. Astro est détecté automatiquement, aucune config à changer → **Deploy**
4. À chaque `git push`, le blog se redéploie tout seul

## Structure

- `src/pages/` : accueil FR (`/`), accueil EN (`/en`), pages billets (`/blog/...`, `/en/blog/...`)
- `src/layouts/` : gabarit global + gabarit d'article (avec lien vers la traduction)
- `src/content/blog/` : les articles, en Markdown
