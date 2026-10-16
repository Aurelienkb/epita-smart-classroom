# EPITA SmartScan — Dossier de Gestion de Projet & Audit IA
**Programme d'Ingénierie GITM — Examen Final : Data & AI Program Management**  
*Auteur : Équipe Projet EPITA SmartScan — Date : 16 Octobre 2026*  
*Projet : EPITA SmartScan — Intelligent Classroom Auditing & Vision Artificielle*  
*Dépôt GitHub :* [https://github.com/Aurelienkb/epita-smart-classroom](https://github.com/Aurelienkb/epita-smart-classroom)  
*Déploiement GitHub Pages :* [https://aurelienkb.github.io/epita-smart-classroom/](https://aurelienkb.github.io/epita-smart-classroom/)  
*Déploiement Cloudflare Pages :* [https://epita-smartscan.pages.dev/](https://epita-smartscan.pages.dev/)

---

## 1. Problématique Métier et Objectifs

### 1.1 Contexte & Problématique Métier
L'EPITA dispose d'un parc immobilier universitaire dense réparti sur plusieurs campus (Kremlin-Bicêtre, Villejuif, etc.), accueillant chaque jour des centaines d'étudiants dans des salles de travaux dirigés (TD), laboratoires informatiques spécialisés (GITM, GISTRE, SIGL) et amphithéâtres.

Chaque typologie de salle est soumise à une **dotation théorique d'équipements** (ex. 10 tables, 20 chaises, 1 tableau blanc, 5 laptops pour une salle de TD standard). Cependant, lors de la vie quotidienne du campus :
- Du mobilier est régulièrement déplacé d'une salle à l'autre par les promotions d'étudiants ou les associations sans traçabilité.
- Les claviers, souris et chargeurs informatiques subissent des disparitions ou des pannes non signalées.
- Les inventaires manuels réalisés par les équipes logistiques campus sont fastidieux (15 à 25 minutes par salle), sujets à des erreurs de comptage humain et rarement consolidés en temps réel.

### 1.2 Objectifs Stratégiques & Opérationnels
1. **Accélération du cycle d'audit :** Réduire la durée moyenne d'inspection d'une salle de 20 minutes à **moins de 2 minutes** grâce à l'automatisation visuelle et au parcours guidé en 6 étapes.
2. **Interactive AI Review (Human-in-the-Loop) :** Offrir un contrôle direct des prédictions du modèle : l'auditeur peut cliquer sur n'importe quelle boîte englobante pour valider un objet, éliminer un faux positif ou corriger une catégorie, avec recalcul dynamique immédiat des écarts.
3. **Séparation rigoureuse des données :** Distinguer sans équivoque les prédictions brutes du modèle de vision, les révisions humaines et l'inventaire consolidé final. Ne jamais imputer une correction humaine à l'IA.
4. **Architecture 100% Edge & RGPD :** Garantir la souveraineté des données et la protection de la vie privée en exécutant l'inférence IA directement dans le navigateur du gestionnaire de campus (zéro fuite de données, zéro serveur cloud pour le traitement d'images, exclusion automatique de toute silhouette humaine).

---

## 2. Parties Prenantes et Utilisateurs Cibles

| Rôle | Profil / Entité | Intérêt & Attentes principales |
| :--- | :--- | :--- |
| **Gestionnaire de Campus (Target User)** | Équipe Logistique & Moyens Généraux | Application mobile rapide, workflow guidé fluide, boutons tactiles accessibles, calcul immédiat des manques. |
| **Responsable Pédagogique GITM** | Direction des Études EPITA | Salles prêtes et conformes avant le début des sessions d'examens et des cours. |
| **DSI / Direction Technique EPITA** | Sécurité informatique | Respect absolu du RGPD, absence d'infrastructure backend lourde ou coûteuse, traitement local WebGL. |
| **Auditeur Qualité Interne** | Responsable de parc | Rapport officiel d'infrastructure clair, recommandations déterministes, traçabilité des vérifications in-situ. |
| **Étudiants EPITA** | Usagers des classes | Disponibilité effective des chaises, prises et équipements informatiques. |

---

## 3. Périmètre MVP et Améliorations Réalisées

### 3.1 Périmètre Inclus (MVP Évolué)
- **Workflow Guidé en 6 Étapes (*Guided Audit Workflow*) :**
  1. *Sélectionner la salle* (chargement de la dotation cible).
  2. *Vérifier la configuration attendue* (ajustement des quotas cibles).
  3. *Capturer ou importer une image* (caméra smartphone, upload ou clichés étalons).
  4. *Exécuter l'analyse IA* (inférence réelle TensorFlow.js COCO-SSD + SAHI + détection tableaux).
  5. *Examiner et corriger les résultats* (*Interactive AI Review* avec sélection directe sur le canvas).
  6. *Valider l'audit et exporter le rapport* (livrable d'infrastructure aux normes EPITA).
- **Interactive AI Review (Contrôle et Correction) :**
  - Maintien des boîtes englobantes avec codes couleurs d'état (cyan pour sélectionné, émeraude pour confirmé, rouge hachuré pour rejeté, ambre pour reclassé).
  - Sélection tactile ou clic direct sur l'objet depuis le canvas ou depuis la pellicule.
  - Panneau inspecteur complet : classe d'origine, classe actuelle, score de confiance, statut.
  - Actions rapides : *Confirmer*, *Rejeter (Faux positif)*, *Corriger la catégorie*, *Réinitialiser*.
  - Recalcul arithmétique instantané des compteurs et des écarts.
- **Centre de Fiabilité & Explicabilité IA (*AI Reliability Center*) :**
  - Distribution des scores en 3 tiers (<40%, 40-70%, $\ge 70\%$).
  - Mention explicite pédagogique : *les scores représentent des activations relatives du modèle et non des probabilités calibrées de justesse terrain*.
  - Bilan des prédictions conservées, rejetées et reclassées.
  - Recensement des classes prises en charge vs non supportées (fenêtres, projecteurs).
  - Diagnostic des occultations de perspective 2D et préconisations de cadrage.
- **Computer Vision Avancée :**
  - *Tuilage HD (SAHI)* : Découpage 4 quadrants pour décupler la résolution sur le mobilier distant.
  - *Boost IA Adaptatif* : Rehaussement de contraste local pour détacher les chaises sombres en fond de salle.
  - *Détecteur Dédié de Tableaux* : Algorithme géométrique et réflectance pour détecter les tableaux muraux absents de COCO-SSD.
  - *Filtrage Éthique* : Exclusion immédiate de la classe `person` (zéro traçage biométrique).
- **Rapport d'Infrastructure Professionnel :**
  - Synthèse exécutive détaillée.
  - Matrice tripartite complète : Cible théorique vs Prédiction IA brute vs Revue humaine vs Inventaire consolidé.
  - Recommandations opérationnelles déterministes par règles métiers.
  - Fiche paginée et stylisée pour l'impression A4/PDF (`@media print`).
  - Bloc de signature formelle (sans allégation trompeuse de type « audit certifié »).

### 3.2 Exclusions Volontaires (Non-Périmètre)
- **Reconnaissance faciale et suivi de personnes :** Strictement interdit par le cahier des charges et l'éthique de l'IA.
- **Backend cloud et bases de données distantes :** Évités pour préserver le budget temps et la conformité RGPD.
- **Addition aveugle de détections multiphotos :** Sans méthode de déduplication 3D certifiée, les prises de vue restent séparées pour éviter les doublons.

---

## 4. Architecture Fonctionnelle et Technique

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        EPITA SmartScan (Frontend PWA)                          │
│                                                                                │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌─────────────────┐  │
│  │  Flux Caméra / Import │   │   Vision Artificielle  │   │  Revue Humaine  │  │
│  │  (HTML5 Media API)    │──>│   TensorFlow.js        │──>│  Interactive    │  │
│  │  Clichés étalons 104  │   │   COCO-SSD + SAHI + CV │   │  AI Review      │  │
│  └───────────────────────┘   └────────────────────────┘   └─────────────────┘  │
│                                           │                        │           │
│                                           ▼                        ▼           │
│                              ┌────────────────────────┐   ┌─────────────────┐  │
│                              │   Canvas Interactif    │   │   Matrice &     │  │
│                              │   Hit-Testing & Glow   │   │   Tripartite    │  │
│                              │   Statuts & Couleurs   │   │   Consolidation │  │
│                              └────────────────────────┘   └─────────────────┘  │
│                                                                    │           │
│                                                                    ▼           │
│                              ┌────────────────────────┐   ┌─────────────────┐  │
│                              │   AI Reliability       │   │  Rapport        │  │
│                              │   Center (Diagnostic)  │   │  Infrastructure │  │
│                              │   Distribution Scores  │   │  Livrable PDF   │  │
│                              └────────────────────────┘   └─────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │            Déploiements & Hébergements      │
                     │  1. Cloudflare Pages (Obligatoire Examen)   │
                     │  2. GitHub Pages (Redondance CI/CD)         │
                     └─────────────────────────────────────────────┘
```

- **Frontend Core :** React 18, TypeScript, Vite 5.
- **Styling :** Tailwind CSS avec thème sombre institutionnel (`#0B1020`, `#151D30`, cyan `#38D9E6`, émeraude `#34D399`).
- **Iconographie :** Lucide React.
- **Vision Artificielle :** `@tensorflow/tfjs` + `@tensorflow-models/coco-ssd` (MobileNet v2) + algorithme de segmentation de tableau de classe (`whiteboardDetector.ts`).
- **Persistance :** LocalStorage pour les configurations de salles et l'historique d'audit (sans stockage persistant d'images).

---

## 5. Backlog des User Stories

| ID | User Story | Priorité | Statut |
| :--- | :--- | :---: | :---: |
| **US-01** | En tant que gestionnaire, je veux sélectionner une salle de cours pour charger sa configuration cible d'équipements. | Must | **Terminé** |
| **US-02** | En tant qu'auditeur, je veux être guidé par un workflow clair en 6 étapes avec navigation fluide sur smartphone. | Must | **Terminé** |
| **US-03** | En tant qu'auditeur, je veux capturer la salle ou charger un cliché étalon avec optimisation adaptative du contraste. | Must | **Terminé** |
| **US-04** | En tant que responsable, je veux que l'IA détecte le mobilier avec tuilage haute résolution (SAHI) et repère les tableaux. | Must | **Terminé** |
| **US-05** | En tant que DPO, je veux qu'aucune silhouette humaine ne soit tracée ou comptabilisée (filtrage éthique RGPD). | Must | **Terminé** |
| **US-06** | En tant qu'auditeur, je veux sélectionner un objet sur l'image pour le confirmer, le rejeter ou corriger sa catégorie (*Interactive Review*). | Must | **Terminé** |
| **US-07** | En tant que responsable, je veux un diagnostic d'explicabilité transparent sans pourcentages de précision inventés (*AI Reliability Center*). | Must | **Terminé** |
| **US-08** | En tant que gestionnaire, je veux une matrice tripartite distinguant Prédictions IA, Revue Humaine et Inventaire Consolidé. | Must | **Terminé** |
| **US-09** | En tant qu'auditeur, je veux exporter un rapport d'infrastructure complet avec synthèse exécutive, recommandations et visa. | Must | **Terminé** |
| **US-10** | En tant que Lead DevOps, je veux une double disponibilité vérifiée sur Cloudflare Pages et GitHub Pages. | Must | **Terminé** |

---

## 6. Indicateurs Clés de Performance (KPI)

> [!IMPORTANT]
> Conformément aux exigences de déontologie de l'examen, toute valeur affichée repose sur une mesure documentée ou est explicitement qualifiée d'« Objectif cible » ou de « Non mesuré ».

| Indicateur (KPI) | Type d'Indicateur | Valeur Documentée / Statut | Méthode de Mesure & Justification |
| :--- | :---: | :---: | :--- |
| **KPI 1 : Taux de détection au premier plan (Jeu Étalon 104)** | Mesure Réelle Observée | **88.2%** (avec SAHI + Boost IA) | Mesuré sur `classroom-standard.jpg` : 15 chaises et 4 tables détectées sur les 17 chaises et 4 tables visibles au premier/second plan. Les chaises du fond à faible contraste nécessitent la revue interactive humaine. |
| **KPI 2 : Taux de détection moyen global sur l'ensemble du campus** | Mesure Globale Terrain | **Non mesuré (Campagne future)** | Nécessitera une campagne d'acquisition sur les 40 salles physiques du campus de Kremlin-Bicêtre lors de la phase de déploiement général. Aucune valeur extrapolée n'est inventée. |
| **KPI 3 : Temps d'exécution d'un audit complet guidé** | Objectif Cible vs Mesure Réelle | Objectif : $\le 120\text{ s}$<br>Observé : **58 secondes** | Chronométré : 10s sélection salle, 15s capture/import, 3.8s inférence SAHI (WebGL client), 22s révision interactive de 3 boîtes, 7s génération PDF. |
| **KPI 4 : Concordance arithmétique de la matrice tripartite** | Mesure Réelle Observée | **100% de concordance algorithmique** | Règle déterministe stricte : $\Delta = N_{\text{consolidé}} - N_{\text{cible}}$, où $N_{\text{consolidé}} = N_{\text{IA\_valides}} + N_{\text{reclassés\_entrants}} - N_{\text{rejetés}}$. Zéro falsification. |
| **KPI 5 : Conformité RGPD (Filtrage des personnes)** | Mesure Réelle Observée | **100% des personnes ignorées** | Testé avec succès sur des scènes comprenant des étudiants : aucune boîte ni vecteur n'est généré pour la classe `person`. |

---

## 7. Protocole de Test et Résultats

### Situation 1 : Salle nominale avec plusieurs équipements visibles
- **Image testée :** `classroom-standard.jpg` (Salle TD 104).
- **Comportement attendu :** Détection simultanée des chaises et tables, détection du tableau mural, possibilité de cliquer sur les boîtes pour validation.
- **Résultat observé :** ✅ Succès. Détection fluide, boîtes englobantes réactives au clic, validation interactive opérationnelle.

### Situation 2 : Salle avec mobilier manquant et révision interactive
- **Image testée :** `classroom-sparse.jpg` (Configuration incomplète).
- **Comportement attendu :** Détection d'un déficit important (-14 chaises), rejet d'un reflet comme faux positif, calcul immédiat de l'écart consolidé.
- **Résultat observé :** ✅ Succès. Le rejet d'une détection décrémente instantanément le compteur consolidé sans altérer le chiffre de prédiction initiale du modèle.

### Situation 3 : Refus d'accès caméra par l'utilisateur
- **Test réalisé :** Révocation des permissions caméra dans le navigateur.
- **Comportement attendu :** Absence de crash, affichage d'un bandeau explicatif bienveillant proposant l'importation de fichier ou le mode démonstration.
- **Résultat observé :** ✅ Succès. L'application intercepte l'erreur `NotAllowedError` et bascule en mode sécurisé avec accès aux scénarios de démo.

### Situation 4 : Déconnexion réseau / Mode Hors-ligne
- **Test réalisé :** Coupure réseau après chargement initial.
- **Comportement attendu :** Maintien complet de l'inférence locale (modèle en mémoire WebGL), révision interactive fonctionnelle, export PDF disponible.
- **Résultat observé :** ✅ Succès. L'architecture 100% client-side fonctionne parfaitement hors-ligne.

---

## 8. Registre des Risques et Mitigation

| Risque Identifié | Gravité | Probabilité | Stratégie de Mitigation |
| :--- | :---: | :---: | :--- |
| **Occultation d'équipements (Perspective 2D)** | Élevée | Élevée | Centre de Fiabilité IA expliquant la limite + Recommandation formelle dans le rapport : *« une absence de détection ne prouve pas une absence physique »*. |
| **Confusion de classes (Table vs Bureau)** | Moyenne | Moyenne | Fonctionnalité de révision interactive permettant de reclasser un objet en 1 clic + regroupement ontologique. |
| **Non-détection de catégories non modélisées** | Moyenne | Certaine | Algorithme dédié pour les tableaux blancs + Statut transparent « Contrôle requis » pour les fenêtres et projecteurs. |
| **Violation de la vie privée (Capture d'étudiants)** | Critique | Faible | Filtrage automatique à la racine du modèle : élimination instantanée de la classe `person` avant tout rendu. |

---

## 9. Limites de l'IA et Considérations Éthiques

1. **Non-calibrage des scores de confiance :** Les scores affichés (ex. 78%) sont des probabilités relatives internes au softmax de MobileNet v2. Ils ne constituent pas des pourcentages de fiabilité absolue sur le terrain. L'application informe explicitement l'auditeur dans le Centre de Fiabilité.
2. **Absence de certification trompeuse :** Le rapport est expressément qualifié de « Livrable d'inventaire et de contrôle interne d'infrastructure » et non d'« audit certifié ».
3. **Engagement éthique et souveraineté :**
   - Aucune image n'est persistée sur un serveur tiers.
   - Aucun transfert télémétrique vers des API externes.
   - Aucune identification biométrique ou tracking.

---

## 10. Liens de Déploiement et Livrables

- **Dépôt GitHub :** [https://github.com/Aurelienkb/epita-smart-classroom](https://github.com/Aurelienkb/epita-smart-classroom)
- **Déploiement GitHub Pages :** [https://aurelienkb.github.io/epita-smart-classroom/](https://aurelienkb.github.io/epita-smart-classroom/)
- **Déploiement Cloudflare Pages :** [https://epita-smartscan.pages.dev/](https://epita-smartscan.pages.dev/)
- **Code source audité :** Compilé avec TypeScript strict (`npm run build` validé sans erreur).

---
*EPITA — École pour l'Informatique et les Techniques Avancées · Spécialisation GITM · Octobre 2026*
