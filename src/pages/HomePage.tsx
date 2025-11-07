import { useNavigate } from "react-router-dom";
import { auth } from "../../FirebaseConfig.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig.ts";
import { useEffect, useState } from "react";
import { type UserData } from "../types/index.ts";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserData);
        } else {
          // reroute to home b/c no user found
          navigate("/");
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">FlowState</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-8">
            Your fitness journey starts here. Track your progress, explore
            exercises, and get personalized recommendations!
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate("/exercises")}
              className="cursor-pointer"
            >
              <FeatureCard
                title="Exercises & Videos"
                description="Browse exercises with animated demonstrations and form videos"
                icon="💪"
              />
            </div>
            <FeatureCard
              title="Track Progress"
              description="Log your workouts and track your progress over time"
              icon="📊"
              comingSoon
            />
            <div onClick={() => navigate("/bmi")} className="cursor-pointer">
              <FeatureCard
                title="BMI Calculator"
                description="Calculate your Body Mass Index and track your health"
                icon="⚖️"
              />
            </div>
            <FeatureCard
              title="Workout Plans"
              description="Create custom workout plans tailored to your goals"
              icon="📝"
              comingSoon
            />
            <FeatureCard
              title="Flex AI"
              description="AI-powered chatbot for personalized workout recommendations"
              icon="🤖"
              comingSoon
            />
            <FeatureCard
              title="Body Diagram"
              description="Interactive body diagram to find exercises by muscle"
              icon="🧍"
              comingSoon
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

function FeatureCard({
  title,
  description,
  icon,
  comingSoon,
}: FeatureCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100 hover:shadow-lg transition-shadow relative">
      {comingSoon && (
        <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
          Coming Soon
        </span>
      )}
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
