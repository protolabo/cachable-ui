---
title: Exigences (fonctionnalités)
---

<style>
    @media screen and (min-width: 76em) {
        .md-sidebar--primary {
            display: none !important;
        }
    }
</style>


# Exigences

## Exigences fonctionnelles

- **Gérer les éléments mis en cache**: Les utilisateurs sont capables de sélectionner/désélectionner/modifier les éléments des pages web qui sont sauvegarder dans leur cache. Ceux-ci doivent rester accessible de façon standalone même hors-connexion (position, style, contenu, fichiers, scripts).

- **Accèder aux pages hors-connexion**: L'extension détecte si la connexion est activée. Si oui, le cache charge les fichiers et scripts qui sont déjà téléchargés et gérer tout contenu dynamique (changement du layout, contenu de page, etc.). Si non, les éléments sauvegardés s'affiche de façon standalone et le reste de la page doit rester vide.

- **Gérer les pages mis en cache**: Via le tableau de bord, les utilisateurs peuvent modifier/supprimer/lire les pages qui sont affectés par l'extension.

- **Ajout de balises dans les éléments HTML**: Les développeurs qui souhaite indiquer des préférences à l'extension peuvent le faire via les balises data-*. L'extension les prend en compte.
    - data-cachableui-forbidden: Flag indiquant que l'élément ne peut pas être sauvegardé.
    - data-cachableui-auto:    Flag indiquant que l'élément doit être automatiquement sauvegardé.
    - data-cachableui-sensibleinput: Flag indiquant que l'input visé est sensible et ne doit pas sauvegarder son contenu (ex: Les champs de mot de passe)
 

## Exigences non fonctionnelles

- **Temps de réponse**: Chaque entrée utilisateur (sauf chargement de lourds fichiers) doit être répondue en moins de 1000ms
- **Sécurité**: L'extension ne doit pas partager les données utilisateurs et les caches, ceux-ci doivent rester sur la machine cliente et ne sort pas de celle-ci.
- **Portabilité**: L'extension est compatible avec le navigateur Chrome 145.0.7632.19
- **Compatibilité**: L'extension est compatible avec les ordinateurs

## Diagramme

![usecase](./res/usecase.png)