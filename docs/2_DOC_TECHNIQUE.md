# Documentation Technique - OpsCenter

## 1. Stack Technologique (La Machinerie)

OpsCenter est une application Full-Stack moderne.

### 1.1. Frontend (L'Interface Utilisateur)
*   **Framework :** React 18, bundlé ultra-rapidement avec Vite.js. (Port par défaut : `5173`).
*   **Langage :** TypeScript (configuration stricte `tsconfig.app.json`).
*   **Styles :** Tailwind CSS + `shadcn/ui`. *Important :* `shadcn/ui` n'est pas une librairie NPM classique. Les composants sont copiés physiquement dans `src/components/ui/` pour que vous ayez la main absolue sur leur code source.
*   **Icônes :** Lucide React.
*   **État (State) :** Context API native de React (`IncidentContext.tsx`). Pas de Redux.

### 1.2. Backend (L'API et le Moteur Ingestion)
*   **Framework :** NestJS (Port par défaut : `3000`). Architecture modulaire.
*   **Langage :** TypeScript.
*   **Base de données :** PostgreSQL.
*   **ORM :** TypeORM (`backend/src/entities/incident.entity.ts`). *Note :* En développement, `synchronize: true` est activé, TypeORM modifie la structure des tables SQL automatiquement quand vous modifiez un objet Entity.
*   **Connexions Externes :** Librairie `mssql` pour se connecter aux bases SQL Server des applications surveillées (KPMG_Risk_Pool, etc.).

### 1.3. Infrastructure de Développement (Docker)
PostgreSQL n'est pas installé sur la machine hôte. Il tourne dans des conteneurs isolés via le fichier `docker-compose.yml` situé à la racine.
*   `incident-db` : Le serveur PostgreSQL (Port virtuel : 5432).
*   `incident-pgadmin` : Interface web optionnelle pour naviguer dans la base sans ligne de commande (Port : 5050).
*   `incident-redis` : Actuellement en veille, préparé pour les futures mises en cache.

---

## 2. Guide d'Installation et Lancement Local

Vous venez de cloner le dépôt. Voici la séquence exacte pour démarrer.

### Étape 1 : Les Variables d'Environnement
Il y a deux fichiers `.env` à surveiller :
1.  **Racine globale (`server/.env`) :** Utilisé par l'ancien proxy/script.
2.  **Dossier Backend (`backend/.env`) :** Le vrai fichier critique pour NestJS. Vérifiez qu'il contient :
    ```env
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=password
    POSTGRES_DB=incident_tracker
    
    # Clé IA optionnelle mais recommandée
    OPENAI_API_KEY=sk-votrecamcachée
    ```

### Étape 2 : L'Installation des Dépendances NPM
Ouvrez DEUX terminaux.
*   Terminal 1 (Racine) : `npm install` (Installe React/Vite)
*   Terminal 2 (`cd backend`) : `npm install` (Installe NestJS/TypeORM)

### Étape 3 : Le Bouton "Play" Centralisé
Un script bash personnalisé a été écrit pour vous éviter de lancer les 3 terminaux (Docker, Front, Back) à la main.

À la racine du projet, lancez :
```bash
./dev-startup.sh
```

Ce script est intelligent :
1. Il coupe d'anciens processus fantômes (`pkill`).
2. Il vérifie si Docker tourne et lance `docker-compose up -d`.
3. Il lance le Backend en tâche de fond (Logs écrits dans `backend.log`).
4. Il lance le Frontend en tâche de fond (Logs dans `frontend.log`).

**Pour tout éteindre proprement :**
Lisez le README, mais un simple `pkill -f "vite|nest"` et `docker-compose down` suffit.

---

## 3. Architecture des Dossiers (Où chercher quoi ?)

### Le Frontend (`/src`)
*   `components/Cockpit/` : Les gros composants intelligents liés aux erreurs (Table, IA Panel).
*   `components/ui/` : Les composants purement esthétiques (Boutons, Badges). **Ne pas lier à des données métier ici.**
*   `pages/` : Les Layouts principaux (Dashboard, Paramètres).
*   `stores/` : Tous les React Contexts (là où vit la donnée en mémoire locale).
*   `lib/` : Fonctions utilitaires (formatage de date, appels Axio/Fetch purs).

### Le Backend (`/backend/src`)
NestJS est organisé par "Modules" métiers.
*   `ai/` : Le service qui contacte l'API OpenAI ou Gemini pour analyser les logs.
*   `config/` : Les contrôleurs listant les bases de données externes surveillées (`sources.json`).
*   `entities/` : Le "Schéma" PostgreSQL. Ce sont les déclarations de classes TypeORM (ex: l'objet `Incident`, l'objet `User`).
*   `ingest/` : **Le dossier le plus critique**. Contient `ingest.service.ts` qui s'arme de sa logique de "hachage" pour fusionner et dédupliquer les millions de logs SQL en "Incidents".
*   `source-code/` : Le module prêt à faire des appels à l'API Azure DevOps pour lire le code de vos projets.
