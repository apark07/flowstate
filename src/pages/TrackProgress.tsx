import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { mockWorkoutLogs, type WorkoutLog } from "../lib/mockData";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

// rows in database: createdAt, date, duration, notes, user_id

// todo: CUD of CRUD (R already done)

export default function TrackProgress() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  //const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    duration: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false); // todo: implement loading state in the html

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "workout_logs"),
        where("user_id", "==", auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setWorkouts([]);
        return;
      } else {
        const workoutLogs: WorkoutLog[] = [];
        // build workout logs from docs sorted by date from most recent --> oldest, where most recent shows on top of the first page and oldest shows last on last page

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          workoutLogs.push({
            id: doc.id,
            date: data.date,
            duration: data.duration,
            notes: data.notes,
            createdAt: data.createdAt,
          });
        });

        // sorting function that returns 1 if b > a, -1 if a > b, 0 if equal
        // its confusing, so here are the docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        setWorkouts(
          workoutLogs.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }
    } catch (err) {
      console.error("Error fetching workouts:", err); // todo: change this so it shows the user error instead of just console logging
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleOpenModal = (workout?: WorkoutLog) => {
    if (workout) {
      setEditingId(workout.id);
      setFormData({
        date: workout.date,
        duration: workout.duration.toString(),
        notes: workout.notes,
      });
    } else {
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        duration: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      duration: "",
      notes: "",
    });
  };

  const handleSaveWorkout = () => {
    if (!formData.date || !formData.duration || !formData.notes.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      // Update existing workout
      setWorkouts(
        workouts.map((w) =>
          w.id === editingId
            ? {
                ...w,
                date: formData.date,
                duration: parseInt(formData.duration),
                notes: formData.notes,
              }
            : w
        )
      );
    } else {
      // Create new workout
      const newWorkout: WorkoutLog = {
        id: Date.now().toString(),
        date: formData.date,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };
      setWorkouts([newWorkout, ...workouts]);
    }

    handleCloseModal();
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      setWorkouts(workouts.filter((w) => w.id !== id));
    }
  };

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <NavBar pageText="Track Your Progress" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workout Log</h1>
            <p className="text-gray-600 mt-2">
              Track your fitness journey by logging your workouts
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add Workout
          </button>
        </div>

        {/* Workouts List */}
        {sortedWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No workouts logged yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your fitness journey by adding your first workout
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Log your first workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {new Date(workout.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {workout.duration} mins
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(workout)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">
                  {workout.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Workout" : "Log a New Workout"}
            </h2>

            <div className="space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  min="1"
                />
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Describe what you did today... exercises, sets, reps, how you felt, etc."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 mt-8 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkout}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {editingId ? "Update Workout" : "Save Workout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
