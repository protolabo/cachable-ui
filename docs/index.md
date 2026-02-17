---
title: Vue d'ensemble du projet
---

<style>
    @media screen and (min-width: 76em) {
        .md-sidebar--primary {
            display: none !important;
        }
    }
</style>

# Vue d'ensemble du projet

!!! info "Informations générales"
    **Session**: Hiver 2026  
    **Auteur(s)**: Bilal Vandenberge  
    **Thème(s)**: Web, Cache, HCI (UI/UX), Génie logiciel  
    **Superviseur(s)**: Louis-Edouard Lafontant  

## Description du projet

<!-- > :bulb: N'oubliez pas d'effacer ou mettre en commentaires les notes (`>`) en début de section -->

### Contexte

<!-- > Présentez le contexte général dans lequel s’inscrit votre projet (social, organisationnel, technologique, éducatif, environnemental, etc.). -->

Sur les applications web le cache est une pièce très importante du puzzle qui forme la vitesse de chargement des pages de nos jours. Mais un point faible se présente : seul le développeur est responsable de la gestion du cache et la plupart du temps celle-ci est peu dévoilée à l'utilisateur. Afin d'avoir un meilleur contrôle et visibilité sur le cache de son navigateur, l'utilisateur pourra utiliser Cachable UI pour manuellement décider de quels éléments sur les pages qu'il visite, il juge utile à garder. Cela lui permet également d'accéder aux applications (en partie) hors-ligne.

### Problématique

<!-- > Décrivez le problème central ou la question de recherche que votre projet cherche à adresser, pourquoi s'y intéresser et les faiblesses des solutions actuelles. 
> Le problème doit pouvoir être compris indépendamment de la solution envisagée. -->

Trouver un compromis entre transparence et rapidité. En quoi une extension qui offre les pleins pouvoirs sur le cache web avec un degré de détails importants peut affecter l'expérience utilisateur et la confiance. Comment pouvons-nous également assurer tout cela tout en respectant la vie privée et propriété intellectuelle ?

Actuellement, le cache web est entièrement sous le contrôle des développeurs. Ça le rend rapide et semble être une solution naturelle, car uniquement le développeur choisis de ce qu'il veut partager sur la machine du client. Mais qu'est-ce qu'il advient de la liberté de l'utilisateur ? Et si celui-ci souhaite comprendre et manuellement autoriser le contenu qui est stocké sur sa propre machine. Cette solution n'envisage absolument pas ce cas.

### Proposition et objectifs

<!-- > Présentez votre proposition de projet et les objectifs visés. Expliquez en quoi votre approche répond à la problématique identifiée. 
> Assurez-vous d'avoir, dans la mesure du possible, des objectifs mesurables, raisonnnables dans le temps et non redondants entre eux. -->

1. Réaliser une extension qui permet la sélection et désélection de certains éléments des pages web afin de les placer entièrement dans le cache. Ceux-ci doivent rester accessibles même hors connexion. On doit donc :
    1.1 Sauvegarder les ressources. (images, vidéos, fichiers externes, ...)
    1.2 Sauvegarder le style, la position et le contenu de l'élément
    1.3 Sauvegarder le scripting (JavaScript) de l'élément
    1.4 Gérer le contenu dynamique et les changements en cas de multiples visites sur un site dont le contenu peut changer souvent

2. Réaliser une partie développeur en HTML (ou react) qui permet au développeur d'apporter des annotations/protections sur leur application à l'égard de l'application. Cela permet :
    2.1 Pour la protection de la vie privée et de la propriété intellectuelle, d'empêcher le téléchargement de certains contenus et éléments
    2.2 De faciliter l'intégration de l'extension dans les pages complexes, en JavaScript

### Méthodologie

<!-- > Expliquez comment vous comptez aborder le projet : démarche générale, grandes étapes prévues, itérations, types de validations envisagées. -->

- Étape 0: Réaliser un squelette de l'extension caractérisé par:
    - Aucun tableau de bord
    - Uniques fonctionnalités: sélection et désélection d'éléments

- Étape 1: Réaliser la première itération - sauvegarde du style
    - Faire en sorte que l'élément sauvegarder garde sa position et son style identique à sa version en ligne

- Étape 2: Réaliser la deuxième itération - sauvegarde de contenu dynamique
    - Gérer le changement du contenu de l'application
    - Gérer le JavaScript derrière les éléments sauvegardés
    - Permettre à l'utilisateur de définir ses paramètres quant à la mise à jour des éléments en cas de nouvelle visite

- Étape 3: Réaliser la troisième itération - Balisage HTML (ou react)
    - Du balisage pour bloquer la mise en cache de certains éléments
    - ...

- Étape 4: Peaufinage + Tableau de bord + Popup
    - Popup: Permet la sélection, désélection, désactivation de l'extension sur la page actuelle
    - Tableau de bord: Liste et nombre de sites et éléments affectés par l'extension, contrôle global
    - Ajout de tests unitaires et débogage

- Étape 5: Évalutation utilisateur
    - Sondage
    - Rapport

### Validation et Évaluation

<!-- > Indiquez comment vous évaluerez que votre solution répond aux objectifs du projet (ex. scénarios d’usage, tests, retours utilisateurs, indicateurs qualitatifs ou quantitatifs). -->

Via trois méthodes d'évaluation:

- Comparaison avec une autre extension: DownThemAll!
- Tests unitaires pour la partie utilisateur et dévloppeur
- 2 Sondages utilisateurs (voir Échéancier) pour évaluer l'UX et l'impact


## Équipe

Bilal Vandenberge: Responsable de projet

## Échéancier

!!! info
    Le suivi complet est disponible dans la page [Suivi de projet](suivi.md).

| Activités               | Début   | Fin     | Livrable                      | Statut      |
|-------------------------|---------|---------|-------------------------------|-------------|
| Ouverture de projet     | 12 jan. | 12 jan. | Proposition de projet         | ✅ Terminé  |
| Études préliminaires    | 12 jan. | 23 jan. | Document d'analyse            | ✅ Terminé  |
| Analyse des exigences   | 20 jan. | 27 jan. | Spécifications de l'extension | ✅ Terminé  |
| Prototypage             | 27 jan. | 10 fev. | Prototype v1                  | 🔄 En cours |
| Évaluation 1            | 16 fev. | 20 fev. | Feedback (rapport)            | ⏳ À venir  |
| Sprint 1                | 16 fev. | 9 mar.  | Extension v1                  | ⏳ À venir  |
| Évaluation 2            | 9 mar.  | 13 mar. | Feedback (rapport)            | ⏳ À venir  |
| Sprint 2                | 9 mar.  | 30 mar. | Extension v2                  | ⏳ À venir  |
| Sprint 3 (peaufinement) | 30 mar. | 17 avr. | Extension finale              | ⏳ À venir  |
| Évaluation 3            | 9 mar.  | 13 mar. | Feedback (rapport)            | ⏳ À venir  |
| Présentation + Rapport  | 17 avr. | 30 avr. | Présentation + Rapport        | ⏳ À venir  |
