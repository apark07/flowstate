import { useState, useMemo, useEffect } from "react";
import NavBar from "../components/NavBar";
import { mockWorkoutLogs } from "../lib/mockData";
import { type WorkoutLog } from "../types/index.ts";
import { auth, db } from "../../FirebaseConfig.ts";
import { useNavigate } from "react-router-dom";
import { getDocs, query, collection, where } from "firebase/firestore";

export default function TrackProgress() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(mockWorkoutLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    duration: "",
    notes: "",
  });
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const itemsPerPage = 5;

  const navigator = useNavigate();

  // Get workouts from database
  const getUserWorkouts = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      navigator("/login");
      return;
    }

    try {
    // fetch the workouts from our Firestore  (not mock data)
      const list: WorkoutLog[] = await fetchUserWorkouts(db, userId);
      setWorkouts(list);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  }

  const fetchUserWorkouts = async (db: any, userId: string) => {
    try {
      const workoutLogsCollectionRef = collection(db, "workout_logs");
      const q = query(workoutLogsCollectionRef, where("user_id", "==", userId));
      const querySnapshot = await getDocs(q);

      const list: WorkoutLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<WorkoutLog, "id">;
        list.push({ id: doc.id, ...(data as Record<string, any>) } as WorkoutLog);
      });

      return list;
    } catch (error) {
      console.error("Error fetching workouts from Firestore:", error);
    }
    return [];
  };

  useEffect(() => {
    getUserWorkouts();
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
        user_id: auth.currentUser?.uid || "unknown",
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
      // TODO : Make this prettier 
      setWorkouts(workouts.filter((w) => w.id !== id));
    }
  };

  // Get unique years and months from workouts for dropdown options
  const availableYears = useMemo(() => {
    const years = workouts.map((w) => new Date(w.date).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [workouts]);

  const availableMonths = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Filter and sort workouts
  const filteredAndSortedWorkouts = useMemo(() => {
    let filtered = [...workouts];

    // Filter by year and month
    if (selectedYear && selectedMonth) {
      const searchMonthStr = `${selectedYear}-${selectedMonth}`;
      filtered = filtered.filter((workout) => {
        const workoutMonth = workout.date.substring(0, 7);
        return workoutMonth === searchMonthStr;
      });
    } else if (selectedYear) {
      // Filter by year only
      filtered = filtered.filter((workout) => {
        return workout.date.startsWith(selectedYear);
      });
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filtered;
  }, [workouts, selectedYear, selectedMonth]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedWorkouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkouts = filteredAndSortedWorkouts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setCurrentPage(1);
  };

  // Format display string for active filter
  const getFilterDisplayText = () => {
    if (selectedYear && selectedMonth) {
      const monthLabel = availableMonths.find((m) => m.value === selectedMonth)?.label;
      return `${monthLabel} ${selectedYear}`;
    } else if (selectedYear) {
      return selectedYear;
    }
    return "";
  };

  const isFilterActive = selectedYear !== "" || selectedMonth !== "";

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

        {/* Search Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by:
            </label>
            
            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              disabled={!selectedYear}
            >
              <option value="">All Months</option>
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Clear Filters
              </button>
            )}

            <span className="ml-auto text-sm text-gray-600">
              {isFilterActive && (
                <span className="font-medium text-indigo-600 mr-2">
                  {getFilterDisplayText()}:
                </span>
              )}
              Showing {paginatedWorkouts.length} of {filteredAndSortedWorkouts.length} workouts
            </span>
          </div>
        </div>

        {/* Workouts List */}
        {filteredAndSortedWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isFilterActive ? "No workouts found for this period" : "No workouts logged yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isFilterActive
                ? "Try selecting a different time period or clear the filters"
                : "Start tracking your fitness journey by adding your first workout"}
            </p>
            {isFilterActive ? (
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Log your first workout
              </button>
            )}
          </div>
        ) : (
          <>
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

                  <p className="text-gray-700 whitespace-pre-wrap">{workout.notes}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
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