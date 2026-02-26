# Documentation Fonctionnelle - OpsCenter

## 1. Vision et Objectif du Produit
**OpsCenter** est une application web métier (B2B) type "Data Cockpit" conçue pour centraliser, simplifier et fiabiliser la supervision des erreurs applicatives éclatées sur plusieurs systèmes. 

L'objectif premier est de transformer le "bruit" des logs techniques bruts (souvent illisibles ou redondants) en un flux d'informations clair, actionnable, et enrichi par l'Intelligence Artificielle pour les équipes de développement et de maintenance.

## 2. Utilisateurs Cibles (Personas)
*   **Le Développeur / Lead Tech :** Utilise l'outil quotidiennement pour voir si ses récents déploiements ont introduit de nouveaux bugs (Régressions). Il consulte OpsCenter pour comprendre la cause racine d'une panne et lire les suggestions de correction proposées par l'IA.
*   **L'Ingénieur Support / DevOps :** Utilise l'outil pour surveiller la santé globale des applications (ex: l'application "Genedoc" tombe-t-elle souvent ?). Il se fie au "Silence Score" pour prioriser les urgences.

## 3. Fonctionnalités Principales

### 3.1. Le Tableau de Bord Central (Apps Overview)
C'est la tour de contrôle. L'utilisateur atterrit sur un écran listant tous les incidents actifs sous forme de tableau interactif.
*   **Tri et Filtrage :** Permet de filtrer les erreurs par Source (Quelle application a planté ?), par Environnement (Prod vs Pre-Prod) et par Statut (Ouvert, Résolu, Ignoré).
*   **Métriques Physiques :** Affichage d'indicateurs clés (Nombre total d'incidents, taux de résolution).

### 3.2. Le "Silence Score" (Innovation Métier)
Au lieu de simplement lister des erreurs, l'outil calcule la priorité visuelle (Score de Silence) d'une erreur pour guider l'humain :
*   **Explosion (Pastille Rouge) :** Une erreur qui vient d'apparaître pour la première fois massivement. *Nécessite une intervention immédiate.*
*   **Actif (Pastille Orange) :** Une erreur persistante qui se répète.
*   **Silencieux (Pastille Grise) :** Une erreur "bruit de fond" connue, qui n'augmente pas brusquement. *Peut être ignorée ou traitée plus tard.*

### 3.3. L'Ingestion Magique (Le Bouton "SYNC SQL")
L'application possède un bouton central qui déclenche un aspirateur à logs.
L'outil se connecte physiquement aux bases de données des applications surveillées, récupère toutes les lignes d'erreurs (Logs), et les **déduplique**.
*Si l'application cliente a crashé 500 fois à cause de la même erreur, OpsCenter ne créera qu'**1 seul ticket** avec un compteur "Occurrences : 500".*

### 3.4. Le Cockpit de Résolution (Tiroir Latéral)
Lorsqu'un utilisateur clique sur une erreur, un panneau s'ouvre pour l'aider à la résoudre.
*   **Historique :** Graphique temporel montrant exactement quand l'erreur est apparue dans le temps (Sparkline).
*   **Alerte Régression :** Si une erreur qu'on croyait réparée réapparaît, l'outil l'affiche avec un badge rouge "RÉGRESSION".
*   **Assistance IA (Auto-Diagnostic) :** Le panneau intègre un rapport généré par l'IA qui pré-mâche le travail :
    *   *Résumé en Français* de la cause du crash.
    *   *Localisation* exacte du fichier coupable (ex: `GenerateDocument.cs Ligne 400`).
    *   *Extrait de code et solution suggérée* pour colmater la faille.

### 3.5. Gestion de l'Etat de Résolution
L'utilisateur peut marquer un incident comme :
*   `En Cours` : L'équipe travaille dessus.
*   `Résolu` : Le patch a été déployé.
*   `Ignoré` : C'est un faux positif, on ne veut plus l'afficher dans les statistiques urgentes.
