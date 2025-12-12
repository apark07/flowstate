import { useState } from "react";
import Model, { type IExerciseData, type IMuscleStats } from "react-body-highlighter";

interface BodyDiagramProps {
  onMuscleClick: (targetMuscle: string) => void;
}

// Map react-body-highlighter muscle names to exercise target names from exercises.json
// Only use valid muscle types from the library
const muscleToTargetMap: Record<string, string> = {
  // Chest
  'chest': 'chest',
  
  // Back
  'upper-back': 'upper back',
  'lower-back': 'lower back',
  'trapezius': 'traps',
  
  // Shoulders
  'front-deltoids': 'delts',
  'back-deltoids': 'delts',
  
  // Arms
  'biceps': 'biceps',
  'triceps': 'triceps',
  'forearm': 'forearm',
  
  // Legs
  'quadriceps': 'quads',
  'hamstring': 'hamstrings',
  'calves': 'calves',
  'left-soleus': 'calves',
  'right-soleus': 'calves',
  'abductors': 'abductors',
  'adductor': 'adductors',
  'obliques': 'abdominals',
  
  // Core
  'abs': 'abdominals',
  
  // Other
  'neck': 'neck',
  'knees': 'knees',
  'head': 'head',
};

export default function BodyDiagram({ onMuscleClick }: BodyDiagramProps) {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  // Sample exercise data for highlighting - MUST use only valid muscle types from library
  const data: IExerciseData[] = [
    { name: "Bench Press", muscles: ["chest", "triceps", "front-deltoids"] },
    { name: "Push Ups", muscles: ["chest", "triceps", "front-deltoids"] },
    { name: "Squats", muscles: ["quadriceps", "gluteal"] },
    { name: "Deadlifts", muscles: ["lower-back", "hamstring", "gluteal"] },
    { name: "Pull Ups", muscles: ["biceps", "back-deltoids"] },
    { name: "Shoulder Press", muscles: ["front-deltoids", "triceps"] },
    { name: "Barbell Rows", muscles: ["back-deltoids", "biceps"] },
    { name: "Leg Press", muscles: ["quadriceps", "gluteal", "hamstring"] },
    { name: "Hamstring Curls", muscles: ["hamstring"] },
    { name: "Dumbbell Curls", muscles: ["biceps"] },
    { name: "Tricep Dips", muscles: ["triceps", "chest"] },
    { name: "Lateral Raise", muscles: ["back-deltoids"] },
  ];

  const handleMuscleClick = (exercise: IMuscleStats) => {
    const muscleName = exercise.muscle;
    const targetMuscle = muscleToTargetMap[muscleName] || muscleName;
    console.log(`Clicked on muscle: ${muscleName} -> searching for: ${targetMuscle}`);
    onMuscleClick(targetMuscle);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Interactive Body Diagram
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        Click on any muscle to filter exercises
      </p>

      {/* View Toggle Buttons */}
      <div className="flex gap-3 mb-6 justify-center">
        <button
          onClick={() => setView("anterior")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors text-sm ${
            view === "anterior"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Front View
        </button>
        <button
          onClick={() => setView("posterior")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors text-sm ${
            view === "posterior"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Back View
        </button>
      </div>

      {/* Body Model */}
      <div className="flex justify-center">
        <Model
          type={view}
          style={{ width: "100%", maxWidth: "250px", padding: "1rem" }}
          data={data}
          onClick={handleMuscleClick}
        />
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          How to Use
        </h4>
        <ul className="space-y-1 text-gray-700 text-xs">
          <li>✓ Click on any muscle to filter exercises</li>
          <li>✓ Switch between front and back views</li>
          <li>✓ Color intensity shows exercise frequency</li>
        </ul>
      </div>
    </div>
  );
}