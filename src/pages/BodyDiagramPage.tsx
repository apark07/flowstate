import { useState } from "react";
//import { useNavigate } from "react-router-dom";
// import { auth, db } from "../../FirebaseConfig";
// import { doc, getDoc } from "firebase/firestore";
// import { type UserData } from "../types/index.ts";
import Model, { type IExerciseData, type IMuscleStats } from "react-body-highlighter";
import NavBar from "../components/NavBar.tsx";

export default function BodyDiagramPage() {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");
  //const navigate = useNavigate();

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
    console.log(`Clicked on muscle: ${exercise.muscle} with ${exercise.data.frequency} exercises`);
    // TODO: Navigate to exercises page filtered by this muscle
    // For now, just show an alert
    alert(`${exercise.muscle} - ${exercise.data.frequency} exercise(s) available`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar pageText="Body Diagram" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Body Diagram
          </h2>
          <p className="text-gray-600 mb-8">
            Click on any muscle to see related exercises
          </p>

          {/* View Toggle Buttons */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setView("anterior")}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                view === "anterior"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setView("posterior")}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                view === "posterior"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Back View
            </button>
          </div>

          {/* Body Model */}
          <div className="flex justify-center mb-8">
            <Model
              type={view}
              style={{ width: "300px", padding: "2rem" }}
              data={data}
              onClick={handleMuscleClick}
            />
          </div>

          {/* Info Section */}
          <div className="gap-6 mt-8">
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How to Use
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✓ Click on any muscle to see available exercises</li>
                <li>✓ Switch between front and back views</li>
                <li>✓ Color intensity shows exercise frequency</li>
                <li>✓ Get personalized workout recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
