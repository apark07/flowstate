import NavBar from "../components/NavBar";

export default function WorkoutPlans() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar pageText="Create your workout plan" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1>Workout Plans</h1>
        <p>Choose a workout plan that fits your goals:</p>
        <ul>
          <li>Weight Loss</li>
          <li>Muscle Gain</li>
          <li>Endurance Training</li>
        </ul>
      </main>
    </div>
  );
}