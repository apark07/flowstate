import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { type WorkoutLog } from "../lib/mockData";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

export default function TrackProgress() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    duration: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


  const exercisesPerPage = 5;

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
        setLoading(false);
        return;
      } else {
        const workoutLogs: WorkoutLog[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          workoutLogs.push({
            user_id: data.user_id,
            id: doc.id,
            date: data.date,
            duration: data.duration,
            notes: data.notes,
            createdAt: data.createdAt,
          });
        });

        setWorkouts(
          workoutLogs.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }
    } catch (err) {
      console.error("Error fetching workouts:", err);
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

  const handleSaveWorkout = async () => {
    if (!formData.date || !formData.duration || !formData.notes.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      const workoutLog = workouts.find((w) => w.id === editingId);

      // update existing workout in the local state
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

      // update existing workout in Firestore
      await setDoc(doc(db, "workout_logs", editingId), {
        ...workoutLog,
        date: formData.date,
        duration: parseInt(formData.duration),
        notes: formData.notes,
      } as Omit<WorkoutLog, "id">); // we do this when setting doc to not include the id field because the id field is already auto made by Firestore 
    
    } else {
      const now = new Date().toISOString();

      // create new workout in Firestore (without the local id field)
      const docRef = await addDoc(collection(db, "workout_logs"), {
        user_id: auth.currentUser!.uid,
        date: formData.date,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        createdAt: now,
      });

      // Update the local workout with the Firestore-generated ID
      const newWorkout: WorkoutLog = {
        user_id: auth.currentUser!.uid,
        date: formData.date,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        createdAt: now,
        id: docRef.id,
      };
      setWorkouts([newWorkout, ...workouts]);
    }

    handleCloseModal();
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      setWorkouts(workouts.filter((w) => w.id !== id));
    }

    // delete workout from Firestore
    await deleteDoc(doc(db, "workout_logs", id));
  };

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedWorkouts.length / exercisesPerPage);
  const startIndex = (currentPage - 1) * exercisesPerPage;
  const paginatedWorkouts = sortedWorkouts.slice(startIndex, startIndex + exercisesPerPage);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5; // Show max 5 page buttons
    const halfWindow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate start and end of middle pages
    const startPage = Math.max(2, currentPage - halfWindow);
    const endPage = Math.min(totalPages - 1, currentPage + halfWindow);

    // Add left ellipsis if needed
    if (startPage > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add right ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900">
              Loading your workouts...
            </h3>
          </div>
        ) : sortedWorkouts.length === 0 ? (
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
            {paginatedWorkouts.map((workout) => (
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

        {/*Pagination controls*/}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            {/* First Page Button */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to first page"
            >
              &lt;&lt;
            </button>

            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to previous page"
            >
              &lt;
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    page === '...'
                      ? 'cursor-default text-gray-500'
                      : currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to next page"
            >
              &gt;
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Go to last page"
            >
              &gt;&gt;
            </button>
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