import { ClassroomRoom } from '../types';

export const DEFAULT_ROOMS: ClassroomRoom[] = [
  {
    id: 'room-td-104',
    name: 'Salle TD 104 — Configuration Examen',
    code: 'KB-104',
    campus: 'EPITA Kremlin-Bicêtre',
    building: 'Bâtiment Pasteur',
    floor: '1er étage',
    capacity: 25,
    expectedConfig: {
      table: 10,
      chair: 20,
      whiteboard: 1,
      laptop: 5,
      screen: 1,
      window: 2,
      keyboard: 0,
      mouse: 0,
      book: 0,
      projector: 1
    },
    description: 'Configuration étalon issue du sujet d\'examen EPITA (10 tables, 20 chaises, 1 tableau, 5 ordinateurs portables).'
  },
  {
    id: 'room-gitm-302',
    name: 'Lab Innovation GITM — Salle 302',
    code: 'KB-302',
    campus: 'EPITA Kremlin-Bicêtre',
    building: 'Bâtiment Parmentier',
    floor: '3ème étage',
    capacity: 28,
    expectedConfig: {
      table: 14,
      chair: 28,
      laptop: 14,
      screen: 2,
      whiteboard: 2,
      window: 3,
      keyboard: 14,
      mouse: 14,
      book: 5,
      projector: 1
    },
    description: 'Laboratoire informatique dédié aux projets d\'ingénierie et Data & AI Program Management.'
  },
  {
    id: 'room-amphi-ada',
    name: 'Amphithéâtre Ada Lovelace',
    code: 'AMPHI-A',
    campus: 'EPITA Kremlin-Bicêtre',
    building: 'Bâtiment Principal',
    floor: 'Rez-de-chaussée',
    capacity: 120,
    expectedConfig: {
      table: 30,
      chair: 60,
      screen: 2,
      whiteboard: 2,
      window: 6,
      laptop: 4,
      keyboard: 0,
      mouse: 0,
      book: 0,
      projector: 2
    },
    description: 'Grand amphithéâtre pour cours magistraux et conférences tech.'
  }
];

const ROOMS_STORAGE_KEY = 'epita_smartscan_rooms_v1';

export function loadSavedRooms(): ClassroomRoom[] {
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!raw) return DEFAULT_ROOMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROOMS;
  } catch (e) {
    console.warn('Failed to load rooms from localStorage, fallback to defaults', e);
    return DEFAULT_ROOMS;
  }
}

export function saveRooms(rooms: ClassroomRoom[]): void {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms to localStorage', e);
  }
}
