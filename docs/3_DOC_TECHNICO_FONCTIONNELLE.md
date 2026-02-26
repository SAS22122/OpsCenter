# Documentation Technico-Fonctionnelle - OpsCenter

Ce document fait le pont entre le "Quoi" (Le métier) et le "Comment" (Le code). 

---

## 1. Le "Silence Score" (Priorisation Visuelle)

**Besoin Métier :** Les équipes ne doivent pas être noyées sous des erreurs vieilles de 6 mois. Elles ont besoin de voir immédiatement ce qui vient de "casser".
**Implémentation Technique :** Le calcul ne se fait pas en base de données, mais dynamiquement dans le Frontend, au niveau du composant React `src/components/Cockpit/IncidentFeed.tsx`.

L'algorithme (`getSilenceScoreVariant` dans `incident-utils.ts`) utilise l'âge de l'erreur brute :
*   `firstSeen` < 24h = **Explosion** (Badge Rouge `destructive`).
*   `firstSeen` > 24h ET `lastSeen` très récent = **Actif** (Badge Orange `warning`).
*   `lastSeen` > 7 jours = **Silencieux** (Badge Gris `secondary`).

---

## 2. Le Mécanisme de Synchronisation SQL (Polling)

**Besoin Métier :** Récupérer les erreurs des applications surveillées (ex: Genedoc, KPMG_Risk_Pool) en cliquant sur un seul bouton sans faire planter le serveur.
**Implémentation Technique :**
Le flux part de `src/stores/IncidentContext.tsx` sur le front (`ApiClient.manualSync()`) et frappe le `ConfigController` du Backend.
1.  **PollerService (`backend/src/config/poller.service.ts`) :**
    C'est un travailleur asynchrone. Il lit `sources.json`, extrait les `DB_USER` et `DB_PASSWORD` sécurisés du serveur, et ouvre une connexion `mssql` directe à la base distante.
    *Optimisation métier :* Il ne requiert que les lignes où `CreatedOn > lastCheck` (Date de la dernière synchro en cache).
2.  **Bulk Processing (`IngestService.processBulkLogs`) :**
    *Crucial :* Si 50 000 logs tombent, on ne fait pas 50 000 requêtes `INSERT`. Le service regroupe d'abord les logs par empreinte (Signature Hash) *en mémoire RAM* dans le Node.js. Puis, il fait un nombre très réduit d'appels à PostgreSQL.

---

## 3. L'Auto-Déduplication et le Hachage (Hash)

**Besoin Métier :** Un Timeout réseau qui apparaît 100 fois doit générer 1 seul ticket avec un compteur à 100.
**Implémentation Technique :**
Le fichier `backend/src/ingest/ingest.service.ts` contient la fonction `normalizeMessage()`.
*   *Exemple de log brut :* `NullReferenceException at Ligne 402 avec l'ID_User 98f4-2aa2`.
*   *Résultat normalisé :* `NullReferenceException at Ligne <L> avec l'ID_User <UUID>`.
Le système hache cette phrase normalisée et le nom de l'application en un MD5 : c'est le champ `errorHash` de PostgreSQL.
Si un nouveau log arrive avec le même `errorHash`, le système fait un simple `UPDATE incident SET occurrenceCount = occurrenceCount + 1`.

---

## 4. La Détection de Régressions

**Besoin Métier :** Savoir si une erreur classée "Résolue" la semaine dernière réapparaît aujourd'hui suite à une mise en production.
**Implémentation Technique :**
Toujours dans `IngestService.ts`, lors de la vérification du `errorHash`, si le backend trouve que l'incident existant a le statut `FIXED` (Résolu), il ne rouvre pas l'ancien ticket.
Il crée une **nouvelle entrée en base de données** avec la même empreinte, mais passe le champ `version` à 2, et le champ `status` à `REGRESSION`. L'UI React détecte le statut `REGRESSION` et affiche une grosse alerte rouge.

---

## 5. L'Agent d'Intelligence Artificielle

**Besoin Métier :** Diagnostiquer la cause racine sans passer 3 heures à lire la Stack Trace.
**Implémentation Technique :**
*   Le module `AiModule` utilise le SDK Officiel OpenAI (mais il est agnostique, configurable pour Azure OpenAI ou Gemini).
*   **Performance :** L'appel à l'API OpenAI coûte de l'argent et prend du temps (2 à 5 secondes). Il n'est déclenché **QUE** lors de la création d'un ticket V1 (Nouveau) ou V2 (Régression). Jamais sur la mise à jour des compteurs.
*   **Prompting (Consigne) :** Le prompt (`ai.service.ts` ligne 40) force l'IA à répondre avec un format JSON strict `{ summary, fix, location }` pour que le Frontend React parse la donnée et l'affiche dans les 3 onglets distincts du panneau "Auto-Fix".

---

## 6. L'Auto-Correction (Accès au Code Source ADO)

**Besoin Métier :** Offrir à l'IA le vrai code source pour que la recommandation de correctif soit exacte.
**Implémentation Technique :**
*   L'IA ne fait plus seulement de la déduction. Le module `SourceCodeModule` est conçu pour lire la base de code sur Azure DevOps.
*   Il scanne la Stack Trace avec une Regex (`/([^/]+\.cs):line (\d+)/`) pour extraire le fichier et la ligne exacts.
*   Il demande à Azure DevOps (via API REST V7) le téléchargement texte du fichier en question (avec les variables `AZURE_DEVOPS_PAT` du `.env`).
*   Il extrait les 15 lignes de code au-dessus et en-dessous de la ligne coupable, injecte ce paragraphe dans la requête l'IA, et lui demande : *"Corrige ce bout de code"*.
