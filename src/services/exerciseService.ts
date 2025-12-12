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
  difficulty?: string;
  category?: string;
  primaryMuscles?: string[];
}

export interface ExerciseFilters {
  bodyPart?: string;
  target?: string;
  equipment?: string;
  name?: string;
  difficulty?: string;
  category?: string;
  muscle?: string;
}

// Cache for exercises data
let exercisesCache: Exercise[] | null = null;

/**
 * Comprehensive muscle name mapping from body diagram/various sources to exercises.json names
 * Maps different naming conventions to the standardized names used in exercises.json
 */
export const getMuscleMapping = (): Record<string, string> => {
  return {
    // Chest
    'chest': 'chest',
    'pectorals': 'chest',
    'pec': 'chest',
    
    // Back
    'back': 'lats',
    'lats': 'lats',
    'lat': 'lats',
    'latissimus': 'lats',
    'latissimus dorsi': 'lats',
    'upper back': 'upper back',
    'upper-back': 'upper back',
    'lower back': 'lower back',
    'lower-back': 'lower back',
    'middle back': 'middle back',
    'middle-back': 'middle back',
    'lowerback': 'lower back',
    'traps': 'traps',
    'trapezius': 'traps',
    'trap': 'traps',
    
    // Shoulders
    'delts': 'shoulders',
    'deltoids': 'shoulders',
    'deltoid': 'shoulders',
    'shoulders': 'shoulders',
    'shoulder': 'shoulders',
    'front-deltoids': 'shoulders',
    'back-deltoids': 'shoulders',
    'rear-deltoids': 'shoulders',
    'side-deltoids': 'shoulders',
    
    // Arms
    'biceps': 'biceps',
    'bicep': 'biceps',
    'triceps': 'triceps',
    'tricep': 'triceps',
    'forearm': 'forearms',
    'forearms': 'forearms',
    
    // Core/Abs
    'abs': 'abdominals',
    'abdominals': 'abdominals',
    'abdominal': 'abdominals',
    'core': 'abdominals',
    'obliques': 'abdominals',
    'oblique': 'abdominals',
    
    // Legs
    'quads': 'quadriceps',
    'quad': 'quadriceps',
    'quadriceps': 'quadriceps',
    'hamstring': 'hamstrings',
    'hamstrings': 'hamstrings',
    'calves': 'calves',
    'calf': 'calves',
    'glutes': 'glutes',
    'glute': 'glutes',
    'buttocks': 'glutes',
    
    // Leg helpers/stabilizers
    'abductors': 'abductors',
    'abductor': 'abductors',
    'adductors': 'adductors',
    'adductor': 'adductors',
    
    // Other
    'neck': 'neck',
    'knees': 'knees',
    'knee': 'knees',
    'head': 'head',
    'soleus': 'calves',
    'left-soleus': 'calves',
    'right-soleus': 'calves',
  };
};

/**
 * Normalize muscle name to match exercises.json standardized names
 */
export const normalizeMuscle = (muscleName: string): string => {
  const mapping = getMuscleMapping();
  const normalized = muscleName.toLowerCase().trim();
  return mapping[normalized] || normalized;
};

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
  'middle back': 'back',
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
    secondaryMuscles: raw.secondaryMuscles,
    difficulty: raw.level || 'intermediate',
    category: raw.category || 'general',
    primaryMuscles: raw.primaryMuscles
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

  if (filters.difficulty) {
    filtered = filtered.filter(ex =>
      ex.difficulty?.toLowerCase() === filters.difficulty!.toLowerCase()
    );
  }

  if (filters.category) {
    filtered = filtered.filter(ex =>
      ex.category?.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.muscle) {
    const muscleName = filters.muscle!.toLowerCase();
    filtered = filtered.filter(ex =>
      (ex.primaryMuscles?.some(m => m.toLowerCase() === muscleName) || false) ||
      (ex.secondaryMuscles?.some(m => m.toLowerCase() === muscleName) || false)
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
  'chest',
  'calf',
  'core',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'calves',
  'glutes',
  'hamstrings',
  'quads',
];

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

/**
 * Extract all unique muscles from exercises (both primary and secondary)
 */
export const fetchUniqueMuscles = async (): Promise<string[]> => {
  try {
    // Load exercises if not cached
    if (!exercisesCache) {
      const response = await fetch('/exercises.json');
      if (!response.ok) throw new Error('Failed to load exercises');
      const rawExercises: RawExercise[] = await response.json();
      exercisesCache = rawExercises.map(transformExercise);
    }

    // Extract all unique muscles
    const muscleSet = new Set<string>();
    exercisesCache.forEach(exercise => {
      if (exercise.primaryMuscles) {
        exercise.primaryMuscles.forEach(m => muscleSet.add(m));
      }
      exercise.secondaryMuscles?.forEach(m => muscleSet.add(m));
    });

    return Array.from(muscleSet).sort();
  } catch (error) {
    console.error('Error fetching unique muscles:', error);
    return [];
  }
};

/**
 * Extract all unique difficulties from exercises
 */
export const fetchUniqueDifficulties = async (): Promise<string[]> => {
  try {
    // Load exercises if not cached
    if (!exercisesCache) {
      const response = await fetch('/exercises.json');
      if (!response.ok) throw new Error('Failed to load exercises');
      const rawExercises: RawExercise[] = await response.json();
      exercisesCache = rawExercises.map(transformExercise);
    }

    // Extract all unique difficulties
    const difficultySet = new Set<string>();
    exercisesCache.forEach(exercise => {
      if (exercise.difficulty) {
        difficultySet.add(exercise.difficulty);
      }
    });

    return Array.from(difficultySet).sort();
  } catch (error) {
    console.error('Error fetching unique difficulties:', error);
    return [];
  }
};

/**
 * Extract all unique categories from exercises
 */
export const fetchUniqueCategories = async (): Promise<string[]> => {
  try {
    // Load exercises if not cached
    if (!exercisesCache) {
      const response = await fetch('/exercises.json');
      if (!response.ok) throw new Error('Failed to load exercises');
      const rawExercises: RawExercise[] = await response.json();
      exercisesCache = rawExercises.map(transformExercise);
    }

    // Extract all unique categories
    const categorySet = new Set<string>();
    exercisesCache.forEach(exercise => {
      if (exercise.category) {
        categorySet.add(exercise.category);
      }
    });

    return Array.from(categorySet).sort();
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return [];
  }
};