---
title: "Déployer une app sans quitter Windows (et sans installer Ubuntu)"
description: "L'aventure de la mise en ligne de Frigo → Recettes : un CLI incompatible, un déploiement par GitHub Actions, et quatre bugs bien cachés."
pubDate: 2026-11-13
lang: fr
tags: [side-project, devops, mistral, github]
translationKey: deployer-sans-quitter-windows
---

Mon app était codée. Elle était même sur GitHub. Restait la dernière étape,
celle qu'on croit être une simple ligne de commande : la mettre en ligne.
Sauf que mon PC tourne sous Windows, que l'outil de déploiement refuse
poliment d'exister pour Windows, et que je n'avais aucune envie d'installer
Ubuntu. Ce billet raconte comment on s'en est sortis, et tout ce que
j'ai appris en route.

## Le problème : un CLI qui n'existe pas chez moi

Pour déployer une app sur la plateforme, la documentation dit : lance la
commande `mistral deploy`. Sauf que cette commande vit dans un outil en
ligne de commande qui n'existe que pour Linux et macOS. Sur Windows :
« Unsupported operating system ». La solution « officielle » aurait été
d'installer WSL, une sorte de Linux à l'intérieur de Windows. J'ai dit non.
Pas par principe, mais parce que j'avais déjà un PC qui marchait très bien,
et qu'ajouter une couche entière de système juste pour lancer une commande,
ça me semblait disproportionné.

## La trouvaille : déployer depuis GitHub, pas depuis mon PC

Et puis une idée : la commande de déploiement n'a pas besoin de tourner
sur *ma* machine. Elle a juste besoin de tourner *quelque part*, avec
accès à mon code. Mon code est sur GitHub. GitHub propose des machines
virtuelles pour exécuter des tâches automatiques (les GitHub Actions),
et ces machines sont sous Linux.

J'ai donc écrit un petit fichier de configuration qui dit à GitHub :
« à chaque fois que je pousse du code, installe l'outil de déploiement
et déploie ». Le tout authentifié par une clé API stockée dans les secrets
du dépôt, jamais dans le code. Résultat : je n'ai rien installé, et en
prime, chaque futur `git push` met mon app à jour automatiquement.
Je ne savais pas encore que ce fichier allait me faire vivre une soirée
entière de débogage.

## Le détecteur de mensonges du CLI

Premier mystère : la commande de déploiement apparaît et disparaît
selon les runs. Même commande, même version de l'outil, parfois
« Unknown subcommand "deploy" », parfois elle marche. En croisant les
logs, la vérité est sortie : l'outil *cache* sa commande de déploiement
tant qu'il n'arrive pas à valider la clé API au démarrage. Quand la
plateforme a un hoquet, la validation échoue, la commande se dissimule,
et le message d'erreur vous envoie chercher un problème qui n'existe pas.
Morale : un message d'erreur n'est pas un diagnostic. Et la parade
est humble : réessayer plusieurs fois, avec un peu de patience
entre chaque essai. Quatre tentatives espacées de 90 secondes,
et les hoquets passent tout seuls.

## Le fichier invisible

Deuxième mystère : mon API démarrait, se connectait à sa base de données,
lançait ses migrations... puis plantait en réclamant un fichier
`uv.lock` que je n'avais jamais entendu mentionner. Il s'agit d'un
« fichier de verrouillage » : la liste exacte des versions des
bibliothèques Python utilisées. Le build en a besoin pour reconstruire
l'environnement à l'identique. Ce fichier devait être généré par un
outil que je n'avais pas, et il manquait à l'appel depuis le début.
Généré, poussé, re-déployé : cette pièce du puzzle a disparu.

## La règle de sécurité qui protège mieux qu'elle ne dérange

Troisième mystère, mon préféré. L'API plantait au démarrage avec une
erreur explicite : `UndeclaredAccessRuleError`. Le framework exige que
chaque morceau d'API déclare *qui a le droit de l'appeler* : une liste
de dépendances d'authentification, vide si le morceau est public. Mes
routes n'avaient rien déclaré, et par défaut le framework refuse de
deviner, parce que « deviner » voudrait dire « rendre public par
silence ». C'est le genre de décision de conception qui paraît
pénible le soir à 23 heures, et qui est exactement ce qu'on veut
dans du code qui finit sur Internet. Une liste vide, deux lignes,
un commit, et mon API a fini par démarrer.

## Verdict

L'app est en ligne. La base de données tourne, l'API répond, l'interface
est servie. Ce que j'ai appris, en vrac :

- **Un déploiement n'a pas besoin de votre machine.** GitHub Actions
  (ou équivalent) déplace le problème vers des machines qui savent le faire.
- **Les erreurs transitoires existent.** Réessayer avant de diagnostiquer.
- **Les fichiers de verrouillage ne sont pas de la décoration.** Sans eux,
  un build reproductible ne l'est pas.
- **La sécurité par défaut doit être pénible.** C'est son travail.

Et moi qui ne voulais juste pas installer Ubuntu.
