export interface SampleImage {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  expectedHighlights: string[];
  scenarioType: 'nominal' | 'discrepant' | 'partial';
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-standard',
    name: 'Scénario 1 : Salle de classe standard',
    category: 'Salle de cours TD',
    url: './samples/classroom-standard.jpg',
    description: 'Salle de cours avec rangées de bureaux d\'étudiants et chaises. Idéal pour tester la détection multiple de mobilier.',
    expectedHighlights: ['Multiples chaises détectées', 'Tables de cours identifiées', 'Tableau visible (non supporté par IA)'],
    scenarioType: 'nominal'
  },
  {
    id: 'sample-laptops',
    name: 'Scénario 2 : Lab Informatique / Laptops',
    category: 'Laboratoire GITM',
    url: './samples/classroom-laptops.jpg',
    description: 'Salle informatique avec ordinateurs portables, bureaux d\'élèves et écrans. Teste la détection d\'équipements IT.',
    expectedHighlights: ['Ordinateurs portables (laptops)', 'Bureaux et moniteurs', 'Diversité des matériels'],
    scenarioType: 'nominal'
  },
  {
    id: 'sample-sparse',
    name: 'Scénario 3 : Salle partielle avec écarts',
    category: 'Configuration incomplète',
    url: './samples/classroom-sparse.jpg',
    description: 'Vue restreinte avec peu d\'équipements visibles. Permet d\'éprouver les alertes d\'écarts et les avertissements de cadrage.',
    expectedHighlights: ['Écart important vs configuration attendue', 'Alerte cadrage partiel', 'Recommandation vérification manuelle'],
    scenarioType: 'discrepant'
  }
];
