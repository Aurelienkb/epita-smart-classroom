import { 
  ClassroomRoom, 
  EquipmentId, 
  AuditItemComparison, 
  AuditReportData, 
  GlobalAuditStatus,
  InteractiveDetection
} from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

export interface ManualOverride {
  verified: boolean;
  manualCount?: number;
  notes?: string;
}

export function computeAuditReport(
  room: ClassroomRoom,
  detections: InteractiveDetection[],
  manualOverrides: Record<string, ManualOverride> = {},
  auditorName: string = 'Auditeur Campus EPITA',
  auditorRole: string = 'Gestionnaire de Campus GITM',
  confidenceThreshold: number = 0.28,
  imageSnapshotUrl?: string,
  durationSeconds?: number
): AuditReportData {
  const items: AuditItemComparison[] = [];
  
  let verifiableRulesCount = 0;
  let discrepanciesCount = 0;
  let unsupportedItemsCount = 0;
  let verifiedCategoriesCount = 0;

  // Evaluate all equipment categories configured for the room
  const equipmentKeys = Object.keys(room.expectedConfig) as EquipmentId[];

  // Also include any equipment detected by the model even if expected count was 0
  const detectedKeys = new Set(detections.map(d => d.currentEquipmentId));
  const allKeys = Array.from(new Set([...equipmentKeys, ...detectedKeys]));

  for (const eqId of allKeys) {
    const expected = room.expectedConfig[eqId] ?? 0;
    const catalogItem = EQUIPMENT_CATALOG[eqId];
    const isSupported = catalogItem ? catalogItem.supportedByModel : false;
    const override = manualOverrides[eqId] || { verified: false };

    // Tripartite breakdown
    const initialDetected = detections.filter(d => d.originalEquipmentId === eqId);
    const initialDetectedCount = initialDetected.length;
    
    const confirmedCount = detections.filter(d => d.currentEquipmentId === eqId && d.status === 'confirmed').length;
    const rejectedCount = detections.filter(d => d.originalEquipmentId === eqId && d.status === 'rejected').length;
    const reclassifiedInCount = detections.filter(d => d.currentEquipmentId === eqId && d.originalEquipmentId !== eqId && d.status === 'reclassified').length;
    const reclassifiedOutCount = detections.filter(d => d.originalEquipmentId === eqId && d.currentEquipmentId !== eqId && d.status === 'reclassified').length;

    // Valid active detections (not rejected as false positive)
    const validDetections = detections.filter(d => d.currentEquipmentId === eqId && d.status !== 'rejected');
    const validDetectedCount = validDetections.length;

    // Average confidence of active detections
    const avgConfidence = validDetectedCount > 0
      ? Math.round(validDetections.reduce((sum, d) => sum + d.score, 0) / validDetectedCount * 100)
      : (initialDetectedCount > 0 
          ? Math.round(initialDetected.reduce((sum, d) => sum + d.score, 0) / initialDetectedCount * 100)
          : 0);

    // Skip items neither expected nor detected
    if (expected === 0 && initialDetectedCount === 0 && !override.verified) {
      continue;
    }

    if (!isSupported) {
      unsupportedItemsCount++;
    } else {
      verifiableRulesCount++;
    }

    // Consolidated count calculation
    let consolidatedCount = validDetectedCount;
    let discrepancy = 0;
    let status: AuditItemComparison['status'];
    let statusLabel: string;
    let observations = '';

    if (override.verified) {
      verifiedCategoriesCount++;
      status = 'verifie_manuellement';
      statusLabel = 'Vérifié manuellement par le responsable';
      if (override.manualCount !== undefined) {
        consolidatedCount = override.manualCount;
        observations = `Validation in-situ (${override.manualCount} validés vs ${initialDetectedCount} détectés initialement). ${override.notes || ''}`;
      } else {
        observations = `Présence confirmée in-situ par l'auditeur. ${override.notes || ''}`;
      }
      discrepancy = consolidatedCount - expected;
    } else if (!isSupported) {
      status = 'non_verifiable';
      statusLabel = 'Non pris en charge par le modèle — vérification manuelle nécessaire';
      consolidatedCount = 0;
      discrepancy = 0;
      observations = `${catalogItem?.labelFr || eqId} absent de l'ontologie d'entraînement. Contrôle visuel requis.`;
    } else {
      // Supported by model and reviewed
      discrepancy = consolidatedCount - expected;

      if (discrepancy === 0) {
        status = 'conforme';
        statusLabel = 'Conforme sur le cliché analysé';
        observations = `Quantité consolidée (${consolidatedCount}) égale à la dotation cible (${expected}).`;
        verifiedCategoriesCount++;
      } else {
        status = 'ecart';
        statusLabel = `Écart constaté (${discrepancy > 0 ? '+' : ''}${discrepancy})`;
        discrepanciesCount++;

        if (discrepancy < 0) {
          observations = `Déficit de ${Math.abs(discrepancy)} unité(s). Une absence de détection ne prouve pas une absence physique (mobilier occulté ou hors champ).`;
        } else {
          observations = `Surplus de ${discrepancy} unité(s) observée(s) par rapport à la dotation standard.`;
        }
      }

      // Append revision notes if human review modified this class
      if (rejectedCount > 0 || reclassifiedInCount > 0 || reclassifiedOutCount > 0) {
        observations += ` [Révision : ${rejectedCount} rejeté(s), +${reclassifiedInCount} reclassé(s) entrant(s), -${reclassifiedOutCount} sortant(s)].`;
      }
    }

    items.push({
      equipmentId: eqId,
      labelFr: catalogItem ? catalogItem.labelFr : eqId,
      supportedByModel: isSupported,
      expectedCount: expected,
      initialDetectedCount,
      confirmedCount,
      rejectedCount,
      reclassifiedInCount,
      reclassifiedOutCount,
      manualCount: override.manualCount,
      consolidatedCount,
      discrepancy,
      manuallyVerified: override.verified,
      status,
      statusLabel,
      averageConfidence: avgConfidence,
      observations: observations.trim()
    });
  }

  // Summary counts
  const totalInitialDetections = detections.length;
  const totalConfirmedObjects = detections.filter(d => d.status === 'confirmed').length;
  const totalRejectedObjects = detections.filter(d => d.status === 'rejected').length;
  const totalReclassifiedObjects = detections.filter(d => d.status === 'reclassified').length;
  const totalConsolidatedObjects = items.reduce((sum, item) => sum + (item.status !== 'non_verifiable' ? item.consolidatedCount : 0), 0);

  const recognizedCategoriesCount = items.filter(i => i.consolidatedCount > 0).length;

  // Audit Readiness calculation (completeness of checks)
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

  // Transparent technical limits
  const technicalLimits = [
    'Le modèle COCO-SSD (MobileNet v2) est optimisé pour 80 classes générales d\'objets. Les fenêtres et vidéoprojecteurs suspendus nécessitent un contrôle visuel direct.',
    'L\'analyse repose sur une photographie ponctuelle 2D. Des équipements peuvent être partiellement masqués par d\'autres rangées (occultation de perspective).',
    'Les scores de confiance représentent des probabilités relatives internes au réseau de neurones et non des mesures absolues de certitude terrain.'
  ];

  // Deterministic, rule-based operational recommendations
  const recommendations: string[] = [];
  if (discrepanciesCount > 0) {
    recommendations.push(`Programmer un contrôle physique prioritaire pour les ${discrepanciesCount} équipement(s) présentant des écarts.`);
  } else {
    recommendations.push('Dotation en mobilier conforme sur le champ visuel analysé.');
  }

  if (totalRejectedObjects > 0) {
    recommendations.push(`${totalRejectedObjects} faux positif(s) éliminé(s) lors de la revue interactive humaine.`);
  }

  const unverifiedNonSupported = items.filter(i => !i.supportedByModel && !i.manuallyVerified);
  if (unverifiedNonSupported.length > 0) {
    recommendations.push(`Valider manuellement in-situ les éléments hors IA (${unverifiedNonSupported.map(i => i.labelFr).join(', ')}).`);
  }

  recommendations.push('Conserver ce rapport interne pour le suivi trimestriel du parc immobilier EPITA.');

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
    totalInitialDetections,
    totalConfirmedObjects,
    totalRejectedObjects,
    totalReclassifiedObjects,
    totalConsolidatedObjects,
    recognizedCategoriesCount,
    verifiableRulesCount,
    discrepanciesCount,
    unsupportedItemsCount,
    auditReadinessScore,
    globalStatus,
    items,
    interactiveDetections: detections,
    technicalLimits,
    recommendations,
    privacyNotice: 'Engagement de confidentialité : Traitement local direct dans le navigateur (Edge Client). Aucune image ni donnée biométrique n\'est envoyée à un serveur distant. Détection de personnes désactivée.',
    imageSnapshotUrl,
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
