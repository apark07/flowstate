import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar.tsx";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <NavBar pageText="Welcome" showLogout={false} />

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
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white border border-gray-200 text-gray-800 font-medium hover:shadow transition"
                >
                  Learn more
                </a>
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

      <main id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
          <p className="mt-2 text-gray-600">What you can do with Flowstate</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col rounded-lg overflow-hidden border border-gray-100">
              <div className="h-40 w-full">
                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" alt="Exercises" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
                <p className="mt-2 text-sm text-gray-600">Browse guided exercises with form tips and videos.</p>
              </div>
            </div>
            <div className="flex flex-col rounded-lg overflow-hidden border border-gray-100">
              <div className="h-40 w-full">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" alt="Track Progress" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Track Progress</h3>
                <p className="mt-2 text-sm text-gray-600">Log workouts, see trends, and stay motivated.</p>
              </div>
            </div>
            <div className="flex flex-col rounded-lg overflow-hidden border border-gray-100">
              <div className="h-40 w-full">
                <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop" alt="Flex AI" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Flex AI</h3>
                <p className="mt-2 text-sm text-gray-600">Get simple, personalized recommendations from an AI coach.</p>
              </div>
            </div>
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
