# OpsCenter - Documentation Technique & Architecture

Bienvenue sur le projet **OpsCenter** (Outil de Suivi d'Incidents). 
Ce document est destiné à tout nouveau développeur rejoignant le projet. Il détaille l'architecture, la stack technologique, le flux de données et les clés pour comprendre et faire évoluer la base de code existante.

---

## 🏗️ 1. Architecture Globale (La Stack)

Le projet est divisé en deux parties distinctes qui communiquent via des API REST : un Backend (NestJS) et un Frontend (React/Vite).

### 1.1. Le Backend (Le Moteur)
*   **Framework :** NestJS (Node.js orienté objet, inspiré d'Angular). Actif sur le port `3000`.
*   **Langage :** TypeScript (strict).
*   **Base de Données Principale :** PostgreSQL (Héberge les tables `Incident` et `User`).
*   **ORM :** TypeORM (Assure la liaison entre TypeScript et Postgres, génère les tables automatiquement en dev).
*   **Tâches de fond :** Un ancien proxy Node.js legacy tourne parfois sur le port `3001` pour lire le fichier config (en cours de migration totale vers NestJS).

### 1.2. Le Frontend (L'Interface)
*   **Framework :** React 18, bundlé ultra rapidement avec Vite. Actif sur le port `5173`.
*   **Langage :** TypeScript.
*   **UI/Design System :** TailwindCSS v3 couplé à ShadCN/UI (composants accessibles et copiables, présents dans `src/components/ui`).
*   **Icônes :** Lucide React.
*   **Appel API :** Axion ou Fetch interne (encapsulé dans `src/lib/api.ts`).
*   **Gestion d'État (Context) :** Utilisation intensive du React Context (`IncidentProvider`) pour un état global partagé.

---

## 🚀 2. Démarrage Rapide (Environnement Local)

L'environnement de développement a été scripté pour être monté en une seule commande.

1.  Assurez-vous d'avoir **Docker** installé et allumé.
2.  Assurez-vous d'avoir **Node.js** (v18+) installé.
3.  À la racine du projet, exécutez le script magique :
    ```bash
    ./dev-startup.sh
    ```
Ce script va automatiquement :
- Lancer le conteneur PostgreSQL via Docker Compose.
- Lancer le Backend NestJS (Logs dans `backend.log`).
- Lancer le Frontend Vite (Logs dans `frontend.log`).

Vos URL locales seront :
- **Frontend** : `http://localhost:5173`
- **Backend API** : `http://localhost:3000`

---

## 🧠 3. Le Coeur du Réacteur : L'Ingestion SQL

La fonctionnalité la plus critique du projet n'est pas l'affichage React, mais la récupération intelligente des milliers de logs SQL.

Tout se passe dans le **Backend**, spécifiquement dans le module `IngestModule` et le contrôleur `ConfigController`.

### Le Flux de Synchronisation (Le Bouton "SYNC SQL")
1.  Le frontend tape le point d'API `POST /config/manual-sync`.
2.  Le `ConfigController` lit le fichier de configuration `server/sources.json` qui contient les identifiants (host, user, table) des bases de données de production (ex: Genedoc Octave).
3.  Il passe ces configs au `PollerService`.
4.  Le `PollerService` utilise la librairie `mssql` pour se connecter *directement* aux bases SQL Server externes. Il récupère toutes les erreurs générées après la date `lastCheck` de chaque source.
5.  Les logs bruts sont envoyés à l'`IngestService`.

### L'Intelligence de Déduplication (`IngestService.ts`)
Les logs ne sont JAMAIS sauvegardés tels quels, ils sont "compressés" pour éviter le bruit. C'est l'algorithme d'Ingestion Massive (`processBulkLogs`).
1.  **Normalisation :** Le fichier `IngestService` passe le message et la stack trace dans le nettoyeur `normalizeMessage()`. Il remplace les IDs dynamiques, les numéros de ligne (`line 123` -> `line <L>`) et les IDs de Process SQL par des variables génériques.
2.  **Signature (Hash) :** Il applique un MD5 sur ce texte normalisé pour créer une "Empreinte Unique" (ErrorHash).
3.  **Vérification DB :** Il regarde si l'empreinte existe déjà dans PostgreSQL (table `incident`).
    - *Si OUI* : Il incrémente simplement le compteur d'occurrence (+1).
    - *Si OUI, mais résolu* : Il crée une "Régression" (Version 2) du ticket.
    - *Si NON* : Il crée un nouvel Incident.

---

## 🤖 4. Le Module Intelligence Artificielle (Gemini/OpenAI)

OpsCenter utilise l'A.I. pour pré-analyser les bugs.
*   **Où se trouve le code ?** `backend/src/ai/ai.service.ts`.
*   **Quand l'appel est-il déclenché ?** Uniquement de manière asynchrone lors de la création d'un TAUX **Nouvel Incident** (V1) ou d'une **Nouvelle Régression** (V2). Cela économise l'API.
*   **Comment l'IA trouve le code si elle n'a pas accès au Github ?** 
    - Actuellement, l'IA utilise l'inférence. Le Backend lui envoie la **Stack Trace** extraite de la base de données SQL. L'IA la lit et en déduit le fichier et la ligne coupables par déduction sémantique.
    - **Le Futur (Azure DevOps) :** Le module `SourceCodeModule` est déjà codé et prêt ! Si vous ajoutez un `AZURE_DEVOPS_PAT` dans le fichier `.env` du Backend, le système téléchargera silencieusement le vrai code source concerné via l'API Azure Repos et l'injectera dans le Prompt de l'IA pour une recommandation parfaite.

---

## 🎨 5. Structure du Frontend (Aide visuelle)

Le dossier le plus important est `/src`.
*   **`/components/ui`** : Les briques Lego brutes (Boutons, Inputs, Toast). Code non-métier.
*   **`/components`** : Les gros morceaux de l'interface (La Table Principale, Le Panneau Latéral, Le Header).
*   **`/pages`** : Les conteneurs de routes complets. (L'accueil s'appelle `AppsOverview.tsx` ou `Dashboard.tsx`).
*   **`/stores`** : C'est ici que vit le cerveau du frontend, le fameux `IncidentContext.tsx`. Il gère le cache et les appels API pour que tous les composants visuels soient synchronisés sans se parler directement.

### Le Score de Silence (Silence Score)
Il s'agit d'une règle "métier" implémentée dans la Table des incidents.
L'algorithme compare la date de première apparition (`firstSeen`) et la fréquence pour attribuer une couleur à l'alerte :
1.  **Explosion (Rouge) :** Erreur récente et massive.
2.  **Actif (Orange) :** Erreur persistante.
3.  **Silencieux (Gris) :** Une vieille erreur dormante qui n'a pas bougé depuis des mois (bruit de fond).

---

## 📋 6. Les Prochaines Tâches Restantes (Backlog P0)

Si vous prenez le relais, voici les chantiers ouverts :

1.  **Intégration Microsoft SSO (Authentification)**
    - *État :* Non commencé.
    - *Mission :* Câbler `auth.module.ts` pour accepter des tokens JWT de Microsoft Entra / Azure AD. Remplacer l'icône de profil statique du Dashboard par la vraie photo Microsoft Graph de l'employé connecté.
2.  **Activation de l'Intégration Code Source (Azure Repos API)**
    - *État :* Câblage architectural terminé, Mock Mode actif.
    - *Mission :* Écrire l'appel Axios à l'API Azure DevOps REST (V7) à la ligne 72 de `backend/src/source-code/source-code.service.ts`.

---

Bon développement ! 
Signé : *L'équipe OpsCenter (et votre Agent IA)*.
