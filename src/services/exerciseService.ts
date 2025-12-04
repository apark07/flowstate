const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
  secondaryMuscles: string[];
}

export interface ExerciseFilters {
  bodyPart?: string;
  target?: string;
  equipment?: string;
  name?: string;
}

/**
 * Fetches exercises from the RapidAPI ExerciseDB API.
 */
export const fetchExercises = async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key is not configured. Please set VITE_RAPIDAPI_KEY in your .env file.');
  }

  try {
    let url = `https://${RAPIDAPI_HOST}/exercises?limit=100`;

    if (filters.bodyPart) {
      url = `https://${RAPIDAPI_HOST}/exercises/bodyPart/${encodeURIComponent(filters.bodyPart)}?limit=100`;
    } else if (filters.target) {
      url = `https://${RAPIDAPI_HOST}/exercises/target/${encodeURIComponent(filters.target)}?limit=100`;
    } else if (filters.equipment) {
      url = `https://${RAPIDAPI_HOST}/exercises/equipment/${encodeURIComponent(filters.equipment)}?limit=100`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed with status ${response.status}`);
    }

    const exercises = await response.json();

    // Filter by name if provided
    let filtered = exercises;
    if (filters.name) {
      filtered = exercises.filter((ex: Exercise) =>
        ex.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching exercises from RapidAPI:', error);
    throw error;
  }
};

export const DEFAULT_BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist'
];

export const fetchBodyParts = async (): Promise<string[]> => {
  return Promise.resolve(DEFAULT_BODY_PARTS);
};

export const fetchTargetMuscles = async (): Promise<string[]> => {
  return Promise.resolve([
    'abductors',
    'adductors',
    'biceps',
    'calves',
    'cardiovascular system',
    'delts',
    'forearms',
    'glutes',
    'hamstrings',
    'lats',
    'pectorals',
    'quads',
    'shoulders',
    'traps',
    'triceps',
    'upper back'
  ]);
};

export const DEFAULT_EQUIPMENT = [
  'assisted',
  'band',
  'barbell',
  'body weight',
  'dumbbell',
  'kettlebell',
  'machine',
  'other'
];

export const fetchEquipmentList = async (): Promise<string[]> => {
  return Promise.resolve(DEFAULT_EQUIPMENT);
};