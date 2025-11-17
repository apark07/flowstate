const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string; // Optional since we'll construct it
  instructions: string[];
  secondaryMuscles: string[];
  difficulty: string;
  category: string;
  description: string;
}

export interface ExerciseFilters {
  bodyPart?: string;
  target?: string;
  equipment?: string;
  name?: string;
}

const fetchOptions = {
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  }
};

// Fetch all exercises (or by filters)
export const fetchExercises = async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
  try {
    let url = `${BASE_URL}/exercises`;

    // If filtering by bodyPart
    if (filters.bodyPart) {
      url = `${BASE_URL}/exercises/bodyPart/${filters.bodyPart}`;
    } 
    // If filtering by target muscle
    else if (filters.target) {
      url = `${BASE_URL}/exercises/target/${filters.target}`;
    }
    // If filtering by equipment
    else if (filters.equipment) {
      url = `${BASE_URL}/exercises/equipment/${filters.equipment}`;
    }
    // If searching by name
    else if (filters.name) {
      url = `${BASE_URL}/exercises/name/${filters.name}`;
    }

    // Add limit to avoid loading too many exercises
    url += '?limit=50';

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response sample:', data[0]); // Log first exercise to inspect structure
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

// Fetch available body parts
export const fetchBodyParts = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/exercises/bodyPartList`, fetchOptions);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching body parts:', error);
    return [];
  }
};

// Fetch available target muscles
export const fetchTargetMuscles = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/exercises/targetList`, fetchOptions);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
};

// Fetch available equipment
export const fetchEquipmentList = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/exercises/equipmentList`, fetchOptions);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

// Default body parts (in case API fails)
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

// Default equipment (in case API fails)
export const DEFAULT_EQUIPMENT = [
  'assisted',
  'band',
  'barbell',
  'body weight',
  'bosu ball',
  'cable',
  'dumbbell',
  'elliptical machine',
  'ez barbell',
  'hammer',
  'kettlebell',
  'leverage machine',
  'medicine ball',
  'olympic barbell',
  'resistance band',
  'roller',
  'rope',
  'skierg machine',
  'sled machine',
  'smith machine',
  'stability ball',
  'stationary bike',
  'stepmill machine',
  'tire',
  'trap bar',
  'upper body ergometer',
  'weighted',
  'wheel roller'
];