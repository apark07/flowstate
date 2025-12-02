import { useState, useEffect } from 'react';
import { 
  fetchExercises, 
  fetchBodyParts,
  type Exercise, 
  DEFAULT_BODY_PARTS
} from '../services/exerciseService';
import ExerciseImage from '../components/ExerciseImage';
import NavBar from '../components/NavBar.tsx';
import BodyDiagram from '../components/BodyDiagram.tsx';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [bodyParts, setBodyParts] = useState<string[]>(DEFAULT_BODY_PARTS);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadBodyParts = async () => {
      const parts = await fetchBodyParts();
      if (parts.length > 0) {
        setBodyParts(parts);
      }
    };
    loadBodyParts();

    const savedFavorites = localStorage.getItem('favoriteExercises');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [selectedBodyPart]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: any = {};
      if (selectedBodyPart) filters.bodyPart = selectedBodyPart;

      const data = await fetchExercises(filters);
      setExercises(data);
    } catch (err) {
      setError('Failed to load exercises. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadExercises();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchExercises({ name: searchTerm });
      setExercises(data);
    } catch (err) {
      setError('Failed to search exercises. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMuscleClick = (muscleName: string) => {
    // TODO: When ready to implement, map muscle names to body parts and trigger search
    console.log('Muscle clicked:', muscleName);
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
  };

  const clearFilters = () => {
    setSelectedBodyPart('');
    setSearchTerm('');
  };

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
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Exercises
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Part
                  </label>
                  <select
                    value={selectedBodyPart}
                    onChange={(e) => setSelectedBodyPart(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Body Parts</option>
                    {bodyParts.map((part) => (
                      <option key={part} value={part}>
                        {formatLabel(part)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedBodyPart || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading exercises...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!loading && !error && exercises.length > 0 && (
              <div className="mb-4 text-gray-600">
                Found {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </div>
            )}

            {!loading && !error && exercises.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isFavorite={favorites.includes(exercise.id)}
                    onToggleFavorite={() => toggleFavorite(exercise.id)}
                  />
                ))}
              </div>
            )}

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

  const formatLabel = (str: string) => {
    return str
      .split(/[\s_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Exercise Image */}
        <div className="relative h-48 bg-gray-100">
          <ExerciseImage
            exerciseId={exercise.id}
            alt={exercise.name}
            className="w-full h-full object-contain"
            gifUrl={exercise.gifUrl}
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
            onClick={() => setShowModal(true)}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
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
                  ×
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
                      alt={exercise.name}
                      className="w-full h-auto object-contain"
                      gifUrl={exercise.gifUrl}
                    />
                  </div>
                  
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