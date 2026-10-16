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

export interface RawDetection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
  equipmentId?: EquipmentId;
}

export type AuditItemStatus = 
  | 'conforme'              // Nombre détecté = attendu
  | 'ecart'                 // Nombre détecté != attendu
  | 'non_verifiable'        // Équipement non pris en charge par le modèle
  | 'verifie_manuellement'; // Validé ou ajusté par le responsable

export interface AuditItemComparison {
  equipmentId: EquipmentId;
  labelFr: string;
  supportedByModel: boolean;
  expectedCount: number;
  detectedCount: number;
  manualCount?: number;
  manuallyVerified: boolean;
  discrepancy: number; // (effectiveCount - expectedCount)
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
  totalDetectedObjects: number;
  recognizedCategoriesCount: number;
  verifiableRulesCount: number;
  discrepanciesCount: number;
  unsupportedItemsCount: number;
  auditReadinessScore: number; // 0 - 100%
  globalStatus: GlobalAuditStatus;
  items: AuditItemComparison[];
  technicalLimits: string[];
  recommendations: string[];
  privacyNotice: string;
  durationSeconds?: number;
}
