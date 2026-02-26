# Architecture du Système - OpsCenter

Voici la vue d'oiseau de l'architecture logicielle de la plateforme OpsCenter.

## 1. Schéma d'Architecture Global

```mermaid
graph TD
    %% Entités Externes
    DB_EXT[(Bases SQL Surveillées\nKPMG_Risk_Pool, etc.)]
    ADO[Azure DevOps Repos\n(Code Source)]
    LLM[API Intelligence Artificielle\nOpenAI / Gemini]

    %% Le Backend (NestJS)
    subgraph BACKEND [Backend Infrastructure (Port 3000 / NestJS)]
        POLLER[PollerService\nMSSQL Connector]
        INGEST[IngestService\nMoteur de Normalisation]
        AI_AGENT[AiService\nAgent Diagnostique]
        SOURCE_CODE[SourceCodeService\nLecteur de Dépôts Git]
        CONTROLLER[REST API Controllers]
        
        POLLER -->|Envoie Logs Bruts| INGEST
        INGEST -->|Déduplique & Sauvegarde| DB_POSTGRES[(PostgreSQL\nTable Incidents)]
        INGEST -.->|Déclenche si NOUVEAU| AI_AGENT
        AI_AGENT -->|Demande le contexte| SOURCE_CODE
        AI_AGENT -->|Sauvegarde de l'analyse| DB_POSTGRES
    end

    %% Connexions Externes du Backend
    POLLER -->|Requêtes périodiques ou manuelles| DB_EXT
    SOURCE_CODE -.->|Fetch API| ADO
    AI_AGENT -->|Prompt JSON Strict| LLM

    %% Le Frontend (React/Vite)
    subgraph FRONTEND [Client Interface (Port 5173 / React)]
        UI[Tableau de Bord\nCockpit UI]
        STORE[IncidentContext\n(Zustand / React Context)]
        UI <-->|Mets à jour l'affichage| STORE
        STORE <-->|Appels REST (Axios)| CONTROLLER
    end
```

## 2. Décision Architecturale Spécifique : Choix du Backend API plutôt que MCP

**Pourquoi `SourceCodeService` n'est pas un MCP (Model Context Protocol) séparé ?**
Lors de la phase de conception, la question de l'accès sécurisé au code source (Hébergé sur Azure DevOps) s'est posée pour nourrir l'Intelligence Artificielle.
*   **Alternative Rejetée :** Développer un Serveur MCP local qui tournerait sur la machine de l'utilisateur. *Raison : Trop complexe à maintenir, oblige l'utilisateur à installer un daemon local, et brise le paradigme d'application Web centralisée.*
*   **Architecture Choise (Server-to-Server) :** C'est le Backend (NestJS) qui, depuis une zone sécurisée, conserve le token d'accès (`AZURE_DEVOPS_PAT`) et requête directement les fichiers via l'API REST d'Azure DevOps. Cela permet à n'importe quel développeur d'ouvrir OpsCenter depuis n'importe où, et d'avoir les suggestions IA sans rien installer localement.

## 3. Flux d'Ingestion (Le Trajet d'une Erreur)

1.  **Capture :** Une erreur éclate sur `Genedoc`. Elle est inscrite dans la table SQL d'origine de Genedoc.
2.  **Aspiration :** L'utilisateur clique sur `SYNC SQL`. Le `PollerService` aspire les lignes plus récentes que son `lastCheck`.
3.  **Traitement en mémoire :** `IngestService` passe la centaine de lignes à la moulinette `normalizeMessage()`.
4.  **Empreinte (Hashing) :** Création du MD5 pour regrouper les erreurs identiques.
5.  **Persistance ou Mise à jour :**
    *   Si Inconnu -> INSERT dans `incident` (Version 1).
    *   Si Connu et Actif -> UPDATE de `occurrenceCount` et `lastSeen`.
    *   Si Connu mais Résolu -> INSERT dans `incident` (Version 2, `status = REGRESSION`).
6.  **Déclenchement IA (Asynchrone) :** Si c'est un INSERT (Nouveau ou Régression), l'`AiService` est notifié. Il lit la Stack Trace, télécharge le fichier ciblé via `SourceCodeService`, et interroge OpenAI. Une minute plus tard, le ticket en base est enrichi du diagnostic (Silencieusement, sans bloquer l'interface).
7.  **Affichage :** Le React Context du Frontend effectue un `polling` ou un rafraîchissement manuel pour afficher les nouvelles colonnes fraîchement remplies par PostgreSQL.
