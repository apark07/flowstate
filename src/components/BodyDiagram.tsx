import { useState } from "react";
import Model, { type IExerciseData, type IMuscleStats } from "react-body-highlighter";

interface BodyDiagramProps {
  onMuscleClick: (muscleName: string) => void;
}

export default function BodyDiagram({ onMuscleClick }: BodyDiagramProps) {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  // Sample exercise data mapped to muscles
  const data: IExerciseData[] = [
    { name: "Bench Press", muscles: ["chest", "triceps", "front-deltoids"] },
    { name: "Push Ups", muscles: ["chest", "triceps", "front-deltoids"] },
    { name: "Squats", muscles: ["quadriceps", "right-soleus", "left-soleus"] },
    { name: "Deadlifts", muscles: ["lower-back"] },
    { name: "Pull Ups", muscles: ["biceps"] },
    { name: "Shoulder Press", muscles: ["front-deltoids", "triceps", "chest"] },
    { name: "Barbell Rows", muscles: ["biceps"] },
    { name: "Leg Press", muscles: ["quadriceps"] },
    { name: "Hamstring Curls", muscles: ["hamstring"] },
    { name: "Dumbbell Curls", muscles: ["biceps"] },
  ];

  const handleMuscleClick = (exercise: IMuscleStats) => {
    console.log(`Clicked on muscle: ${exercise.muscle}`);
    onMuscleClick(exercise.muscle);
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