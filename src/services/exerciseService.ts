import { fetchStructuredExercises } from "./geminiService";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
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

/**
 * Fetches exercises using the Gemini API to generate structured data.
 */
export const fetchExercises = async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
  try {
    let prompt = "Generate a list of 50 common fitness exercises.";

    if (filters.bodyPart) {
      prompt = `Generate a list of 50 common fitness exercises primarily targeting the body part: ${filters.bodyPart}.`;
    } else if (filters.target) {
      prompt = `Generate a list of 50 exercises that primarily target the muscle: ${filters.target}.`;
    } else if (filters.equipment) {
      prompt = `Generate a list of 50 common exercises that use the following equipment: ${filters.equipment}.`;
    } else if (filters.name) {
      prompt = `Generate a list of up to 50 exercises where the name includes or is similar to '${filters.name}'.`;
    }
    
    prompt += " For the 'gifUrl' property, use a generic hosted placeholder URL that is different for every exercise. Use the format 'https://placehold.co/360x360/E0E7FF/000000?text=EXERCISE_ID' where EXERCISE_ID is the 'id' property.";

    const data = await fetchStructuredExercises(prompt);
    
    return data.map(exercise => ({
        ...exercise,
        gifUrl: exercise.gifUrl || `https://placehold.co/360x360/E0E7FF/000000?text=${String(exercise.id).toUpperCase()}`
    }));

  } catch (error) {
    console.error('Error fetching exercises from Gemini:', error);
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