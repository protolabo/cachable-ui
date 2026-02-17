---
title: Suivi du projet
---

<style>
    @media screen and (min-width: 76em) {
        .md-sidebar--primary {
            display: none !important;
        }
    }
</style>

# Suivi de projet

<!-- > :bulb: Cette page documente l’évolution du projet dans le temps.
> Elle sert à rendre visibles les décisions, ajustements et apprentissages.
> Les entrées peuvent être hebdomadaires ou bi-hebdomadaires.  
> N'oubliez pas d’effacer ou de mettre en commentaires les notes (`>`) avant la remise finale. -->

---

## Semaine 1 (12–18 janvier)

### Objectifs de la période

- Clarifier la problématique
- Explorer les solutions existantes

### Travail réalisé

!!! abstract "Avancement"
    - [x] Choix de portabilité : Chrome
        - Recherche dans la documentation Firefox & Chromium
    - [x] Analyse de solutions existantes
        - [Google Cache](https://addons.mozilla.org/fr/firefox/addon/google-cache/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)
        - [Textarea Cache](https://addons.mozilla.org/fr/firefox/addon/textarea-cache/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)
        - [DownThemAll](https://addons.mozilla.org/fr/firefox/addon/downthemall/)
    - [x] Recherche sur la technologie PWA

### Décisions et ajustements

<!-- > À compléter uniquement si des choix structurants ont été faits
> ou si l’orientation du projet a évolué. -->

!!! info "Décisions"
    - Choix du navigateur par défaut pour l'extension : Chrome (/ Chromium)

### Difficultés rencontrées

<!-- > À compléter uniquement si des obstacles ont eu un impact réel
> sur l’avancement du projet. -->

!!! warning "Difficultés"
    - Limitations de la gestion du cache sur Firefox

## Semaine 2 (19-26 janvier)

### Objectifs de la période

- Identifier les exigences
- Produire la description détaillée du projet

### Travail réalisé

!!! abstract "Avancement"
    - [x] Exigences
        - Fonctionnalités
        - Portabilité
    - [ ] Renseignement sur le cache et le développement d'extension Chromium

### Décisions et ajustements

Voir la page des [fonctionnalités](./features.md)

## Semaine 3 (26-31 Janvier)

### Objectifs de la période

- Début du prototypage

### Travail réalisé

!!! abstract "Avancement"
    - [x] Ajout d'un mode éditeur
    - [x] Ajout d'une liste d'élément dans le popup
    - [x] Ajout d'une sérialisation

### Décisions et ajustements

Utilisation de la librairie domJSON

## Semaine 4 (02-09 Février)

### Objectifs de la période

- Avancer dans la première itération

### Travail réalisé

!!! abstract "Avancement"
    - [x] Ajout de la fonctionnalité "voir un élément seul"
    - [x] Ajout de la db locale avec chrome.storage.local
    - [x] Correction de bugs d'affichage dans le popup
    - [x] Amélioration du style du mode éditeur

### Difficultés rencontrées

!!! warning "Difficultés"
    - La librairie domJSON ne gère pas correctement position, style et attributs

## Semaine 5 (09-16 Février)

### Objectifs de la période

- Avancer dans la première itération

### Travail réalisé

!!! abstract "Avancement"
    - [x] Ajout d'un arrière plan
    - [x] Corriger des bugs de style
    - [x] Gérer la signature des éléments
    - [x] Ajout de la fonctionnalité "page hors-ligne"

### Décisions et ajustements

Pour le moment, nous réfléchissons encore à la mise au point d'un système de mise à jour des éléments. Les signatures de ceux-ci dépendent de leur contenu. Donc, dans les contenus dynamiques, certains éléments ne seront plus détectés. Pour l'instant, nous envisageons deux approches :

1. Système de version (style git): Archives gardées sur la machine de l'utilisateur
2. Système de mutation:            Adaptation intelligente du cache en identifiant nouveaux éléments et éléments modifiés (avec confirmation utilisateur) 

Utilisation de la librairie html2Canva

### Difficultés rencontrées

!!! warning "Difficultés"
    - Limite de 10MB dans le stockage local (chrome.storage.local)
    - Peu d'outils disponibles pour prendre une capture d'une page entière
