import { 
  ClassroomRoom, 
  EquipmentId, 
  AuditItemComparison, 
  AuditReportData, 
  GlobalAuditStatus 
} from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';
import { DetectionOutput } from './aiVision';

export interface ManualOverride {
  verified: boolean;
  manualCount?: number;
  notes?: string;
}

export function computeAuditReport(
  room: ClassroomRoom,
  detectionOutput: DetectionOutput,
  manualOverrides: Record<string, ManualOverride> = {},
  auditorName: string = 'Auditeur Campus EPITA',
  auditorRole: string = 'Gestionnaire de Campus GITM',
  confidenceThreshold: number = 0.45,
  durationSeconds?: number
): AuditReportData {
  const items: AuditItemComparison[] = [];
  
  let verifiableRulesCount = 0;
  let discrepanciesCount = 0;
  let unsupportedItemsCount = 0;
  let verifiedCategoriesCount = 0;

  // We evaluate all equipment present in the expected config
  const equipmentKeys = Object.keys(room.expectedConfig) as EquipmentId[];

  for (const eqId of equipmentKeys) {
    const expected = room.expectedConfig[eqId] ?? 0;
    // Skip items neither expected nor detected
    const detected = detectionOutput.counts[eqId] || 0;
    const catalogItem = EQUIPMENT_CATALOG[eqId];
    const isSupported = catalogItem ? catalogItem.supportedByModel : false;
    const override = manualOverrides[eqId] || { verified: false };
    const avgConfidence = detectionOutput.averageConfidenceByEquipment[eqId] || 0;

    if (expected === 0 && detected === 0) {
      continue;
    }

    if (!isSupported) {
      unsupportedItemsCount++;
    } else {
      verifiableRulesCount++;
    }

    let status: AuditItemComparison['status'];
    let statusLabel: string;
    let discrepancy = 0;
    let observations = '';

    if (override.verified) {
      verifiedCategoriesCount++;
      status = 'verifie_manuellement';
      statusLabel = 'Vérifié manuellement par le responsable';
      const effectiveCount = override.manualCount !== undefined ? override.manualCount : detected;
      discrepancy = effectiveCount - expected;

      if (override.manualCount !== undefined) {
        observations = `Comptage ajusté par l'auditeur (${override.manualCount} validés vs ${detected} vus par IA). ${override.notes || ''}`;
      } else {
        observations = `Présence validée in-situ par l'auditeur. ${override.notes || ''}`;
      }
    } else if (!isSupported) {
      status = 'non_verifiable';
      statusLabel = 'Non pris en charge par le modèle — vérification manuelle nécessaire';
      discrepancy = 0; // Cannot compute numeric discrepancy without detection
      observations = `${catalogItem?.labelFr || eqId} absent de l'ontologie COCO-SSD standard. Contrôle visuel humain requis.`;
    } else {
      // Supported and not yet manually verified
      discrepancy = detected - expected;
      
      if (discrepancy === 0) {
        status = 'conforme';
        statusLabel = 'Conforme sur l\'image analysée';
        observations = `Quantité détectée (${detected}) parfaitement conforme à la configuration théorique (${expected}).`;
        verifiedCategoriesCount++;
      } else {
        status = 'ecart';
        statusLabel = `Écart observé sur l\'image analysée (${discrepancy > 0 ? '+' : ''}${discrepancy})`;
        discrepanciesCount++;

        if (discrepancy < 0) {
          observations = `Déficit de ${Math.abs(discrepancy)} unité(s). Note : une absence de détection ne signifie pas nécessairement une absence physique (mobilier hors champ ou occulté).`;
        } else {
          observations = `Surplus de ${discrepancy} unité(s) détectée(s) par rapport à la dotation standard.`;
        }
      }
    }

    items.push({
      equipmentId: eqId,
      labelFr: catalogItem ? catalogItem.labelFr : eqId,
      supportedByModel: isSupported,
      expectedCount: expected,
      detectedCount: detected,
      manualCount: override.manualCount,
      manuallyVerified: override.verified,
      discrepancy,
      status,
      statusLabel,
      averageConfidence: avgConfidence,
      observations: observations.trim()
    });
  }

  // Calculate distinct recognized categories with at least 1 genuine detection
  const recognizedCategoriesCount = Object.values(detectionOutput.counts).filter(c => c > 0).length;

  // Calculate Audit Readiness (Complétude du contrôle)
  const totalConfiguredCategories = items.length || 1;
  const auditReadinessScore = Math.min(100, Math.round((verifiedCategoriesCount / totalConfiguredCategories) * 100));

  // Determine global status
  let globalStatus: GlobalAuditStatus;
  if (discrepanciesCount > 0) {
    globalStatus = 'ATTENTION_ECART';
  } else if (unsupportedItemsCount > 0 && verifiedCategoriesCount < totalConfiguredCategories) {
    globalStatus = 'VERIFICATION_REQUISE';
  } else {
    globalStatus = 'CONFORME';
  }

  // Formulate transparent technical limitations and clear recommendations
  const technicalLimits = [
    'Le modèle pré-entraîné COCO-SSD (MobileNet v2) est limité à 80 classes générales et ne reconnaît pas les tableaux muraux ni les fenêtres.',
    'L\'analyse est réalisée sur une photographie ponctuelle 2D. Des équipements peuvent être masqués par d\'autres rangées (occultation partielle) ou situés en dehors de l\'angle de champ.',
    'Les variations d\'éclairage et les reflets sur les écrans peuvent modifier les scores de confiance du réseau de neurones.'
  ];

  const recommendations = [
    discrepanciesCount > 0 
      ? `Effectuer une vérification physique des ${discrepanciesCount} équipement(s) présentant des écarts de quantité.`
      : 'Aucun écart quantitatif constaté sur les catégories reconnues par le modèle.',
    unsupportedItemsCount > 0
      ? `Contrôler manuellement les éléments non pris en charge par l'IA (Tableaux, Fenêtres, etc.) avant de clore l'audit.`
      : 'Toutes les catégories de la salle bénéficient d\'un support automatisé.',
    'Pour un audit exhaustif, capturer si nécessaire un second cliché depuis l\'angle opposé de la salle.'
  ];

  const reportId = `AUD-${room.code}-${Date.now().toString(36).toUpperCase()}`;

  return {
    id: reportId,
    timestamp: new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    auditorName,
    auditorRole,
    room,
    confidenceThreshold,
    totalDetectedObjects: detectionOutput.totalCount,
    recognizedCategoriesCount,
    verifiableRulesCount,
    discrepanciesCount,
    unsupportedItemsCount,
    auditReadinessScore,
    globalStatus,
    items,
    technicalLimits,
    recommendations,
    privacyNotice: 'Garantie de confidentialité EPITA : Traitement 100% local dans le navigateur. Aucune image ni donnée biométrique n\'est transmise ni conservée sur un serveur distant. Détection de personnes désactivée.',
    durationSeconds
  };
}

const AUDIT_HISTORY_KEY = 'epita_smartscan_audit_history_v1';

export function saveAuditToHistory(report: AuditReportData): void {
  try {
    const existingRaw = localStorage.getItem(AUDIT_HISTORY_KEY);
    const existing: AuditReportData[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Keep last 15 audits
    const updated = [report, ...existing.filter(a => a.id !== report.id)].slice(0, 15);
    localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save audit history:', e);
  }
}

export function loadAuditHistory(): AuditReportData[] {
  try {
    const raw = localStorage.getItem(AUDIT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load audit history:', e);
    return [];
  }
}
