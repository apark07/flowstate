import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar.tsx";
import FlexAIPicture from "../lib/flexai_picture.png";
import WorkoutLogPicture from "../lib/workoutlog_picture.png";
import LandingPageCard from "../components/LandingPageCard.tsx";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <NavBar pageText="" showLogout={false} />

      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Move better. Feel better.
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Simple tools to track progress, learn new exercises, and build
                healthy habits. Start your fitness journey with short,
                guided steps.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
                >
                  Get started
                </button>
                {/* <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white border border-gray-200 text-gray-800 font-medium hover:shadow transition"
                >
                  Learn more
                </a> */}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop"
                  alt="workout"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop"
                  alt="yoga"
                  className="w-full h-36 object-cover rounded-lg shadow"
                />
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=250&fit=crop"
                  alt="running"
                  className="w-full h-36 object-cover rounded-lg shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

{/* we can refactor these into cards*/}

      <main id="features" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-semibold text-gray-900">Features</h1>
          <p className="mt-2 text-gray-600 text-xl">What you can do with Flowstate</p>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <LandingPageCard
              image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop"
              text="Exercises"
              subtext="Browse guided exercises with form tips and videos."
            />
            <LandingPageCard
              image={WorkoutLogPicture}
              text="Track Progress"
              subtext="Log workouts, see trends, and stay motivated."
            />
            <LandingPageCard
              image={FlexAIPicture}
              text="Flex AI"
              subtext="Get simple, personalized recommendations from an AI coach."
            />
          </div>
        </section>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Flowstate — Built with care
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
