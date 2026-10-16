// Domain Types for EPITA SmartScan

export type EquipmentId = 
  | 'chair'
  | 'table'
  | 'laptop'
  | 'screen'
  | 'keyboard'
  | 'mouse'
  | 'book'
  | 'whiteboard'
  | 'window'
  | 'projector';

export interface EquipmentDefinition {
  id: EquipmentId;
  labelFr: string;
  labelEn: string;
  cocoClasses: string[]; // Classes in COCO-SSD that correspond to this item
  supportedByModel: boolean;
  category: 'furniture' | 'it' | 'infrastructure' | 'supplies';
  icon: string;
  standardConfidenceThreshold: number;
  description: string;
}

export interface ExpectedItemConfig {
  equipmentId: EquipmentId;
  expectedCount: number;
  mandatory: boolean;
  notes?: string;
}

export interface ClassroomRoom {
  id: string;
  name: string;
  code: string;
  campus: string;
  building: string;
  floor: string;
  capacity: number;
  expectedConfig: Record<EquipmentId, number>;
  description: string;
}

export type DetectionStatus = 'detected' | 'confirmed' | 'rejected' | 'reclassified';

export interface InteractiveDetection {
  id: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
  originalClass: string;
  originalEquipmentId: EquipmentId;
  currentEquipmentId: EquipmentId;
  score: number;
  status: DetectionStatus;
  labelFr: string;
  color: string;
  userNote?: string;
}

export type AuditItemStatus = 
  | 'conforme'              // Nombre consolidé = attendu
  | 'ecart'                 // Nombre consolidé != attendu
  | 'non_verifiable'        // Équipement non pris en charge par le modèle
  | 'verifie_manuellement'; // Validé ou ajusté par le responsable

export interface AuditItemComparison {
  equipmentId: EquipmentId;
  labelFr: string;
  supportedByModel: boolean;
  expectedCount: number;
  
  // Tripartite Separation (Model vs Human vs Consolidated)
  initialDetectedCount: number; // Raw predictions from model
  confirmedCount: number;       // Confirmed by human auditor
  rejectedCount: number;        // Rejected false positive
  reclassifiedInCount: number;  // Shifted into this category by auditor
  reclassifiedOutCount: number; // Shifted out of this category by auditor
  manualCount?: number;         // Manual in-situ count for non-model items

  consolidatedCount: number;    // Effective verified count
  discrepancy: number;          // consolidatedCount - expectedCount
  
  manuallyVerified: boolean;
  status: AuditItemStatus;
  statusLabel: string;
  averageConfidence: number;
  observations: string;
}

export type GlobalAuditStatus = 'CONFORME' | 'ATTENTION_ECART' | 'VERIFICATION_REQUISE';

export interface AuditReportData {
  id: string;
  timestamp: string;
  auditorName: string;
  auditorRole: string;
  room: ClassroomRoom;
  confidenceThreshold: number;
  
  // High-level metrics
  totalInitialDetections: number;
  totalConfirmedObjects: number;
  totalRejectedObjects: number;
  totalReclassifiedObjects: number;
  totalConsolidatedObjects: number;

  recognizedCategoriesCount: number;
  verifiableRulesCount: number;
  discrepanciesCount: number;
  unsupportedItemsCount: number;
  auditReadinessScore: number; // 0 - 100%
  globalStatus: GlobalAuditStatus;
  
  items: AuditItemComparison[];
  interactiveDetections: InteractiveDetection[];
  technicalLimits: string[];
  recommendations: string[];
  privacyNotice: string;
  imageSnapshotUrl?: string;
  durationSeconds?: number;
}

export type AuditWorkflowStep = 
  | 1 // Sélectionner la salle
  | 2 // Vérifier la configuration attendue
  | 3 // Capturer ou importer une image
  | 4 // Exécuter l'analyse IA
  | 5 // Examiner et corriger (Interactive AI Review)
  | 6; // Valider et exporter le rapport
