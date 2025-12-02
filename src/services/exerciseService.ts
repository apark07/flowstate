import { fetchStructuredExercises } from "./geminiService";

// The Exercise interface is kept for compatibility with ExercisesPage.tsx
// It is now the expected output structure from the Gemini API
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string; // Changed to required as Gemini will generate a placeholder URL
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

// NOTE: All RapidAPI functionality has been removed and replaced with Gemini API.

/**
 * Fetches exercises using the Gemini API to generate structured data.
 * The prompt is constructed based on the provided filters.
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
      // For name search, we request specific exercises related to the name
      prompt = `Generate a list of up to 50 exercises where the name includes or is similar to '${filters.name}'.`;
    }
    
    // Add instruction for image placeholder
    prompt += " For the 'gifUrl' property, use a generic hosted placeholder URL that is different for every exercise. Use the format 'https://placehold.co/360x360/E0E7FF/000000?text=EXERCISE_ID' where EXERCISE_ID is the 'id' property.";

    const data = await fetchStructuredExercises(prompt);
    
    // Fallback/Safety Check: Ensure a GIF URL is present by enforcing the placeholder rule
    return data.map(exercise => ({
        ...exercise,
        gifUrl: exercise.gifUrl || `https://placehold.co/360x360/E0E7FF/000000?text=${exercise.id.toUpperCase()}`
    }));

  } catch (error) {
    console.error('Error fetching exercises from Gemini:', error);
    // Since the API is not a dedicated exercise DB, we return an empty array on failure.
    throw new Error('Failed to load exercises. The AI service may be unavailable or the request failed.');
  }
};

// Since Gemini is not a database, we return static lists to populate dropdowns.

// Default body parts (in case API fails or for dropdown population)
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

/**
 * Replaces the old API call for body parts with static data.
 */
export const fetchBodyParts = async (): Promise<string[]> => {
  return Promise.resolve(DEFAULT_BODY_PARTS);
};

/**
 * We keep the interface for these, but they are not used in ExercisesPage.tsx.
 * For completeness, they will return empty lists or defaults if needed.
 */
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

// Default equipment (in case API fails) - kept for mock completeness
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