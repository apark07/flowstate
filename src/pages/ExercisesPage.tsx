import { useState, useEffect } from 'react';
import { 
  fetchExercises,
  fetchUniqueMuscles,
  fetchUniqueDifficulties,
  fetchUniqueCategories,
  type Exercise
} from '../services/exerciseService';
import ExerciseImage from '../components/ExerciseImage';
import NavBar from '../components/NavBar.tsx';
import BodyDiagram from '../components/BodyDiagram.tsx';
import Pagination from '../components/Pagination.tsx';

const EXERCISES_PER_PAGE = 10;

// Define a simple structure for caching exercise data
interface CachedExercises {
    timestamp: number;
    data: Exercise[];
}

// Define cache key constants
const CACHE_KEY_PREFIX = 'exercise_cache_';
// Cache expiration time: 1 hour (3600000 milliseconds)
const CACHE_EXPIRATION = 3600000;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [muscles, setMuscles] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [uniqueMuscles, uniqueDifficulties, uniqueCategories] = await Promise.all([
        fetchUniqueMuscles(),
        fetchUniqueDifficulties(),
        fetchUniqueCategories()
      ]);
      setMuscles(uniqueMuscles);
      setDifficulties(uniqueDifficulties);
      setCategories(uniqueCategories);
    };
    loadFilterOptions();

    const savedFavorites = localStorage.getItem('favoriteExercises');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    const loadExercisesOnMount = async () => {
      setCurrentPage(1); // Reset to first page when body part changes
      // Determine the cache key based on the active filter
      const currentFilter = selectedBodyPart || 'all';
      const cacheKey = CACHE_KEY_PREFIX + currentFilter;

      // 1. Check Cache First
      const cachedItem = localStorage.getItem(cacheKey);
      if (cachedItem) {
          try {
              const cache: CachedExercises = JSON.parse(cachedItem);
              const isStale = Date.now() - cache.timestamp > CACHE_EXPIRATION;

              if (!isStale) {
                  console.log('Loading exercises from cache.');
                  setExercises(cache.data);
                  setError(null);
                  return; // Stop loading immediately
              }
          } catch (e) {
              console.error('Error parsing cache, fetching fresh data:', e);
              localStorage.removeItem(cacheKey);
          }
      }

      // 2. If no valid cache, load from API
      setLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filters: any = {};
        if (selectedBodyPart) filters.bodyPart = selectedBodyPart;

        const data = await fetchExercises(filters);
        setExercises(data);

        // 3. Save new data to cache
        const cache: CachedExercises = { timestamp: Date.now(), data };
        localStorage.setItem(cacheKey, JSON.stringify(cache));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching exercises.';
        setError(`Failed to load exercises: ${errorMessage}. Check your console for full error details.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExercisesOnMount();
  }, [selectedBodyPart]);

  const toggleShowFavoritesAndSearch = () => {
    setCurrentPage(1); // Reset to first page when toggling favorites
    setShowFavorites(!showFavorites);
    if (!showFavorites) {
      const favExercises = exercises.filter(ex => favorites.includes(ex.id));
      setExercises(favExercises);
    } else {
      loadExercises();
    }
  }

  const loadExercises = async () => {
    // Determine the cache key based on the active filter
    const currentFilter = selectedBodyPart || 'all';
    const cacheKey = CACHE_KEY_PREFIX + currentFilter;

    // 1. Check Cache First
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
        try {
            const cache: CachedExercises = JSON.parse(cachedItem);
            const isStale = Date.now() - cache.timestamp > CACHE_EXPIRATION;

            if (!isStale) {
                console.log('Loading exercises from cache.');
                setExercises(cache.data);
                setError(null);
                return; // Stop loading immediately
            }
        } catch (e) {
            console.error('Error parsing cache, fetching fresh data:', e);
            localStorage.removeItem(cacheKey);
        }
    }

    // 2. If no valid cache, load from API
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any = {};
      if (selectedBodyPart) filters.bodyPart = selectedBodyPart;

      const data = await fetchExercises(filters);
      setExercises(data);

      // 3. Save new data to cache
      const cache: CachedExercises = { timestamp: Date.now(), data };
      localStorage.setItem(cacheKey, JSON.stringify(cache));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching exercises.';
      setError(`Failed to load exercises: ${errorMessage}. Check your console for full error details.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any = {};
      if (searchTerm.trim()) filters.name = searchTerm;
      if (selectedMuscle) filters.muscle = selectedMuscle;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty;
      if (selectedCategory) filters.category = selectedCategory;

      const data = await fetchExercises(filters);
      setExercises(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while searching exercises.';
      setError(`Failed to search exercises: ${errorMessage}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMuscleClick = (muscleName: string) => {
    // Set the selected muscle filter to the clicked muscle
    setSelectedMuscle(muscleName);
    setCurrentPage(1); // Reset to first page
    
    // Fetch exercises with the muscle filter
    const fetchMuscleExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExercises({ muscle: muscleName });
        setExercises(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to load exercises for ${muscleName}: ${errorMessage}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMuscleExercises();
    console.log('Filtering exercises for muscle:', muscleName);
  };

  const toggleFavorite = (exerciseId: string) => {
    let updatedFavorites: string[];
    
    if (favorites.includes(exerciseId)) {
      updatedFavorites = favorites.filter(id => id !== exerciseId);
    } else {
      updatedFavorites = [...favorites, exerciseId];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteExercises', JSON.stringify(updatedFavorites));
    
    // If we're showing favorites, reset to page 1 to reflect the updated favorites
    if (showFavorites) {
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setCurrentPage(1); // Reset to first page when clearing filters
    setSearchTerm('');
    setSelectedBodyPart('');
    setSelectedMuscle('');
    setSelectedDifficulty('');
    setSelectedCategory('');
    // Reload all exercises
    loadExercises();
  };

  // Calculate pagination
  const displayedExercises = showFavorites
    ? exercises.filter(ex => favorites.includes(ex.id))
    : exercises;
  
  const paginatedExercises = displayedExercises.slice(
    (currentPage - 1) * EXERCISES_PER_PAGE,
    currentPage * EXERCISES_PER_PAGE
  );
  const totalPages = Math.ceil(displayedExercises.length / EXERCISES_PER_PAGE);

  const formatLabel = (str: string) => {
    return str
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar pageText="Exercise Library" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Body Diagram */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BodyDiagram onMuscleClick={handleMuscleClick} />
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              {/* Search Bar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Exercises
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Search by exercise name..."
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Muscle Group
                  </label>
                  <select
                    value={selectedMuscle}
                    onChange={(e) => setSelectedMuscle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="">All Muscles</option>
                    {muscles.map((muscle) => (
                      <option key={muscle} value={muscle}>
                        {formatLabel(muscle)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {formatLabel(difficulty)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="">All Types</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {formatLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleSearch}
                className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors mb-4 text-sm font-medium"
              >
                Apply Filters
              </button>

              {/* Clear Filters Button */}
              {(selectedBodyPart || selectedMuscle || selectedDifficulty || selectedCategory || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading exercises...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Num exercises + Favorites in a row */}
            <div className="flex mb-4 justify-between items-center">
              {/* Results Count */}
              {!loading && !error && exercises.length > 0 && (
                <div className="mb-4 text-gray-600">
                  Found {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Show exercises the user favorited via toggle */}
              <div className="mb-4">
                <button
                  onClick={toggleShowFavoritesAndSearch}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  {showFavorites ? 'Show All Exercises' : `Show My Favorite Exercises (${favorites.length})`}
                </button>
              </div>
            </div>
            {/* Exercise Grid */}
            {!loading && !error && displayedExercises.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      isFavorite={favorites.includes(exercise.id)}
                      onToggleFavorite={() => toggleFavorite(exercise.id)}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}

            {/* Empty State */}
            {!loading && !error && exercises.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function ExerciseCard({ exercise, isFavorite, onToggleFavorite }: ExerciseCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatLabel = (str: string) => {
    return str
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleNextImage = () => {
    if (exercise.images && exercise.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % exercise.images.length);
    }
  };

  const handlePreviousImage = () => {
    if (exercise.images && exercise.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + exercise.images.length) % exercise.images.length);
    }
  };

  const currentImage = exercise.images && exercise.images.length > 0 
    ? exercise.images[currentImageIndex] 
    : exercise.gifUrl;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Exercise Image */}
        <div className="relative h-48 bg-gray-100">
          <ExerciseImage
            exerciseId={exercise.id}
            gifUrl={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-contain"
          />
          <button
            onClick={onToggleFavorite}
            className="absolute top-3 right-3 text-2xl hover:scale-110 transition-transform bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {formatLabel(exercise.name)}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
              {formatLabel(exercise.bodyPart)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              {formatLabel(exercise.target)}
            </span>
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
              {formatLabel(exercise.equipment)}
            </span>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setCurrentImageIndex(0);
            }}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 bg-blue-50 rounded-lg px-3 py-1 hover:bg-blue-100 transition-colors"
          >
            📖 Show Instructions
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{formatLabel(exercise.name)}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-20">
                      {formatLabel(exercise.bodyPart)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-20">
                      Target: {formatLabel(exercise.target)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-20">
                      {formatLabel(exercise.equipment)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(95vh-160px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Left Side - Video/GIF */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden sticky top-0">
                    <ExerciseImage
                      exerciseId={exercise.id}
                      gifUrl={currentImage}
                      alt={exercise.name}
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* Image Navigation Controls */}
                  {exercise.images && exercise.images.length > 1 && (
                    <div className="space-y-3">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handlePreviousImage}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                          Next →
                        </button>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        Image {currentImageIndex + 1} of {exercise.images.length}
                      </div>
                    </div>
                  )}
                  
                  {/* Secondary Muscles */}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Secondary Muscles</h3>
                      <div className="flex flex-wrap gap-2">
                        {exercise.secondaryMuscles.map((muscle, index) => (
                          <span key={index} className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            {formatLabel(muscle)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Instructions */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📋 Step-by-Step Instructions
                  </h3>
                  <ol className="space-y-3">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed pt-0.5">
                          {instruction}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}