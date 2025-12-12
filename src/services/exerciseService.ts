// GitHub raw URL base for exercise images
const GITHUB_IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Interface for raw exercise data from free-exercise-db
interface RawExercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  instructions: string[];
  images: string[];
  force?: string;
  level?: string;
  mechanic?: string | null;
  category?: string;
}

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

// Cache for exercises data
let exercisesCache: Exercise[] | null = null;

// Map primary muscles to body parts for filtering
const muscleToBodyPart: Record<string, string> = {
  'abdominals': 'core',
  'abductors': 'lower legs',
  'adductors': 'lower legs',
  'biceps': 'upper arms',
  'calves': 'lower legs',
  'cardiovascular system': 'cardio',
  'delts': 'shoulders',
  'forearms': 'lower arms',
  'glutes': 'lower legs',
  'hamstrings': 'lower legs',
  'lats': 'back',
  'pectorals': 'chest',
  'quads': 'lower legs',
  'shoulders': 'shoulders',
  'traps': 'back',
  'triceps': 'upper arms',
  'upper back': 'back',
  'lower back': 'back',
  'chest': 'chest',
  'back': 'back',
  'neck': 'neck',
  'wrist': 'lower arms',
  'ankles': 'lower legs',
  'groin': 'lower legs',
  'hips': 'lower legs',
  'legs': 'lower legs',
  'spine': 'core'
};

/**
 * Convert raw exercise from free-exercise-db to our Exercise interface
 */
const transformExercise = (raw: RawExercise): Exercise => {
  const primaryMuscle = raw.primaryMuscles[0] || 'general';
  const bodyPart = muscleToBodyPart[primaryMuscle] || primaryMuscle;
  
  // Get the first image and convert to GitHub URL
  const imagePath = raw.images[0] || '';
  const gifUrl = imagePath ? `${GITHUB_IMAGE_BASE}/${imagePath}` : '';

  return {
    id: raw.id,
    name: raw.name,
    bodyPart,
    target: primaryMuscle,
    equipment: raw.equipment || 'body weight',
    gifUrl,
    instructions: raw.instructions,
    secondaryMuscles: raw.secondaryMuscles
  };
};

/**
 * Loads exercises from local exercises.json file (from free-exercise-db)
 */
export const fetchExercises = async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
  try {
    // Load from cache if available
    if (exercisesCache) {
      return applyFilters(exercisesCache, filters);
    }

    // Fetch from public folder
    const response = await fetch('/exercises.json');
    if (!response.ok) {
      throw new Error(`Failed to load exercises: ${response.status}`);
    }

    const rawExercises: RawExercise[] = await response.json();
    
    // Transform all exercises
    exercisesCache = rawExercises.map(transformExercise);

    return applyFilters(exercisesCache, filters);
  } catch (error) {
    console.error('Error loading exercises:', error);
    throw error;
  }
};

/**
 * Apply filters to exercises array
 */
const applyFilters = (exercises: Exercise[], filters: ExerciseFilters): Exercise[] => {
  let filtered = exercises;

  if (filters.bodyPart) {
    filtered = filtered.filter(ex =>
      ex.bodyPart.toLowerCase() === filters.bodyPart!.toLowerCase()
    );
  }

  if (filters.target) {
    filtered = filtered.filter(ex =>
      ex.target.toLowerCase() === filters.target!.toLowerCase()
    );
  }

  if (filters.equipment) {
    filtered = filtered.filter(ex =>
      ex.equipment.toLowerCase() === filters.equipment!.toLowerCase()
    );
  }

  if (filters.name) {
    filtered = filtered.filter(ex =>
      ex.name.toLowerCase().includes(filters.name!.toLowerCase())
    );
  }

  return filtered;
};

export const DEFAULT_BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'core',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs'
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
    'upper back',
    'lower back',
    'abdominals'
  ]);
};

export const DEFAULT_EQUIPMENT = [
  'body weight',
  'dumbbell',
  'barbell',
  'kettlebell',
  'machine',
  'cable',
  'bands',
  'medicine ball',
  'foam roll',
  'other'
];

export const fetchEquipmentList = async (): Promise<string[]> => {
  return Promise.resolve(DEFAULT_EQUIPMENT);
};