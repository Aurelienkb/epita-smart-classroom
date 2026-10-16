# EPITA SmartScan — Intelligent Classroom Auditing
> **Application web progressive (PWA) d'audit automatisé et d'inventaire de salles de cours par Vision Artificielle embarquée.**  
> Projet réalisé dans le cadre de l'examen final **EPITA — IA for Managers (Spécialisation GITM)**.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Compatible-F38020?style=flat&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

---

## 📸 Aperçu & Concept Produit

**EPITA SmartScan** permet à un gestionnaire de campus ou responsable logistique d'auditer l'inventaire d'une salle en quelques secondes depuis un smartphone ou un ordinateur :
1. **Sélection de la salle :** Chargement de la dotation théorique (ex. *Salle TD 104 : 10 tables, 20 chaises, 1 tableau, 5 laptops*).
2. **Capture visuelle :** Activation de la caméra (caméra arrière prioritaire) ou importation d'une photo.
3. **Inférence IA réelle :** Détection d'objets embarquée via le modèle pré-entraîné **COCO-SSD** exécuté directement dans le navigateur.
4. **Matrice de comparaison :** Calcul automatique des écarts numériques (surplus/déficit).
5. **Human-in-the-Loop :** Validation et ajustement in-situ par l'auditeur pour les éléments hors-IA (tableaux, fenêtres).
6. **Rapport d'audit certifié :** Génération et exportation PDF / impression professionnelle avec visa d'audit.

---

## 🚀 Fonctionnalités Clés

- **⚡ Inférence 100% Client-Side :** Traitement local via WebGL sans envoi d'images vers un serveur externe.
- **🛡️ Éthique & Respect du RGPD :** Exclusion stricte et automatique de toute analyse ou reconnaissance de personnes.
- **🎯 Visualisation Optique Haute Définition :** Cadres réticulaires cyan et émeraude sur Canvas HTML5 avec scores de confiance et classes métier en français.
- **🧭 Guided Scan :** Conseils de cadrage contextualisés pour minimiser les occultations de mobilier et les contre-jours.
- **🤝 Human-in-the-Loop :** Séparation nette entre prédictions brutes du modèle et validations humaines confirmées.
- **📊 Indicateur "Audit Readiness" :** Mesure objective du taux de complétude du contrôle.
- **📱 PWA Mobile-First :** Manifest, icônes tactiles et Service Worker pour une installation fluide sur smartphone.
- **🖨️ Export PDF Ready :** Feuille de style dédiée `@media print` pour un compte-rendu A4 professionnel.

---

## 🛠️ Stack Technique

- **Frontend :** React 18, TypeScript, Vite 5.
- **Design System :** Tailwind CSS avec palette sombre SaaS (`#0B1020`, `#151D30`, cyan `#38D9E6`, émeraude `#34D399`).
- **Composants & Icônes :** Lucide React.
- **Vision Artificielle :** `@tensorflow/tfjs` et `@tensorflow-models/coco-ssd` (architecture MobileNet v2).
- **Hébergement cible :** Cloudflare Pages (déploiement statique ultra-rapide sur réseau Edge mondial).

---

## 💻 Démarrage Rapide en Local

### 1. Prérequis
- **Node.js** (v18+ ou v20+ recommandé)
- **NPM**

### 2. Installation des dépendances
```bash
git clone https://github.com/<votre-compte>/epita-smart-classroom.git
cd epita-smart-classroom
npm install
```

### 3. Lancement du serveur de développement
```bash
npm run dev
```
L'application s'ouvre sur `http://localhost:5173`.

### 4. Compilation de production
```bash
npm run build
```
Les fichiers statiques optimisés sont générés dans le dossier `dist/`.

---

## ☁️ Déploiement sur Cloudflare Pages

L'application a été expressément architecturée pour un déploiement sans friction sur **Cloudflare Pages** :

1. Connectez-vous à votre [Tableau de bord Cloudflare](https://dash.cloudflare.com/).
2. Rendez-vous dans **Workers & Pages** › **Create application** › **Pages** › **Connect to Git**.
3. Sélectionnez votre dépôt GitHub `epita-smart-classroom`.
4. Renseignez les paramètres de build suivants :
   - **Framework preset :** `Vite`
   - **Build command :** `npm run build`
   - **Build output directory :** `dist`
   - **Production branch :** `main`
5. Cliquez sur **Save and Deploy**.
6. Cloudflare fournit immédiatement une URL publique en HTTPS (ex. `https://epita-smart-classroom.pages.dev`).

*(Note : le fichier `public/_redirects` présent dans le projet garantit la bonne résolution des routes en mode Single Page Application).*

---

## 🧪 Scénarios de Test Embarqués

Trois jeux d'images étalons sont directement intégrés dans l'application pour tester l'IA en 1 clic :
1. **Scénario 1 : Salle de classe standard (Nominal)** — Détection de rangées complètes de chaises et tables d'étudiants.
2. **Scénario 2 : Lab Informatique GITM (IT)** — Détection de laptops et ordinateurs portables.
3. **Scénario 3 : Salle partielle avec écarts (Discrepant)** — Test des alertes d'écarts et recommandations de vérification physique.

---

## 🔒 Confidentialité & Limites du Modèle

- **Ontologie COCO-SSD :** Le modèle reconnaît 80 catégories courantes (chaises, tables, ordinateurs, écrans, etc.). Il ne reconnaît pas nativement les tableaux muraux ni les fenêtres : l'application indique clairement leur statut *« Non pris en charge par le modèle — vérification manuelle nécessaire »*.
- **Absence de détection $\neq$ absence physique :** Un équipement masqué par une rangée au premier plan ou hors champ n'est pas inventé par l'IA.
- **Politique Zero-Server :** Aucun flux vidéo ni photographie n'est transmis à un serveur distant.

---

## 📄 Dossier de Gestion de Projet

Le dossier complet de gestion de projet exigé par le sujet d'examen est disponible dans le fichier [`PROJECT_REPORT.md`](./PROJECT_REPORT.md) :
- Problématique métier, parties prenantes et utilisateurs cibles.
- Périmètre MVP et exclusions.
- Backlog de 10 User Stories avec critères d'acceptation.
- Planning détaillé sur 4 heures.
- 3 KPIs documentés avec mesures effectives.
- Protocole de test sur 4 situations critiques.
- Registre des risques et feuille de route V2.

---
*EPITA — École pour l'Informatique et les Techniques Avancées · Majeure GITM · Octobre 2026*
