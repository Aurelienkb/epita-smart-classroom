import { EquipmentDefinition } from '../types';

export const EQUIPMENT_CATALOG: Record<string, EquipmentDefinition> = {
  chair: {
    id: 'chair',
    labelFr: 'Chaises / Sièges',
    labelEn: 'Chairs',
    cocoClasses: ['chair'],
    supportedByModel: true,
    category: 'furniture',
    icon: 'Armchair',
    standardConfidenceThreshold: 0.45,
    description: 'Chaises individuelles ou sièges pliants d\'étudiants.'
  },
  table: {
    id: 'table',
    labelFr: 'Tables / Bureaux',
    labelEn: 'Tables & Desks',
    cocoClasses: ['dining table'],
    supportedByModel: true,
    category: 'furniture',
    icon: 'SquareMenu',
    standardConfidenceThreshold: 0.40,
    description: 'Tables de cours, bureaux d\'élèves ou tables de travaux pratiques.'
  },
  laptop: {
    id: 'laptop',
    labelFr: 'Ordinateurs portables',
    labelEn: 'Laptops',
    cocoClasses: ['laptop'],
    supportedByModel: true,
    category: 'it',
    icon: 'Laptop',
    standardConfidenceThreshold: 0.50,
    description: 'Laptops d\'étudiants ou machines de TP.'
  },
  screen: {
    id: 'screen',
    labelFr: 'Écrans / Moniteurs',
    labelEn: 'Monitors & Displays',
    cocoClasses: ['tv'],
    supportedByModel: true,
    category: 'it',
    icon: 'Monitor',
    standardConfidenceThreshold: 0.45,
    description: 'Écrans de retour vidéo, moniteurs fixes ou téléviseurs d\'affichage.'
  },
  keyboard: {
    id: 'keyboard',
    labelFr: 'Claviers d\'ordinateur',
    labelEn: 'Keyboards',
    cocoClasses: ['keyboard'],
    supportedByModel: true,
    category: 'it',
    icon: 'Keyboard',
    standardConfidenceThreshold: 0.50,
    description: 'Périphériques de saisie dans les salles informatiques.'
  },
  mouse: {
    id: 'mouse',
    labelFr: 'Souris d\'ordinateur',
    labelEn: 'Computer Mice',
    cocoClasses: ['mouse'],
    supportedByModel: true,
    category: 'it',
    icon: 'Mouse',
    standardConfidenceThreshold: 0.45,
    description: 'Souris optiques filaires ou sans-fil.'
  },
  book: {
    id: 'book',
    labelFr: 'Manuels & Livres',
    labelEn: 'Books',
    cocoClasses: ['book'],
    supportedByModel: true,
    category: 'supplies',
    icon: 'BookOpen',
    standardConfidenceThreshold: 0.45,
    description: 'Documentation pédagogique, polycopiés et manuels de cours.'
  },
  whiteboard: {
    id: 'whiteboard',
    labelFr: 'Tableau (Blanc / TBI)',
    labelEn: 'Whiteboard',
    cocoClasses: [], // Not supported in COCO-SSD standard dataset
    supportedByModel: false,
    category: 'infrastructure',
    icon: 'Presentation',
    standardConfidenceThreshold: 0,
    description: 'Tableau mural feutre ou tableau interactif. Non reconnu nativement par COCO-SSD.'
  },
  window: {
    id: 'window',
    labelFr: 'Fenêtres de classe',
    labelEn: 'Windows',
    cocoClasses: [], // Not supported in COCO-SSD
    supportedByModel: false,
    category: 'infrastructure',
    icon: 'Maximize',
    standardConfidenceThreshold: 0,
    description: 'Ouvertures extérieures et vitrages. Non reconnu nativement par COCO-SSD.'
  },
  projector: {
    id: 'projector',
    labelFr: 'Vidéoprojecteur plafond',
    labelEn: 'Ceiling Projector',
    cocoClasses: [], // Not supported in standard COCO 80
    supportedByModel: false,
    category: 'infrastructure',
    icon: 'Projector',
    standardConfidenceThreshold: 0,
    description: 'Projecteur audiovisuel suspendu au plafond.'
  }
};

// Map raw COCO-SSD class string to our equipment catalog ID
export function mapCocoClassToEquipmentId(cocoClass: string): string | null {
  const normalized = cocoClass.toLowerCase().trim();
  
  // Privacy safeguard: immediately ignore people
  if (normalized === 'person') {
    return null;
  }
  
  for (const eq of Object.values(EQUIPMENT_CATALOG)) {
    if (eq.cocoClasses.includes(normalized)) {
      return eq.id;
    }
  }
  
  return null;
}
