import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar.tsx";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar pageText="Home" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-8">
            Your fitness journey starts here. Track your progress, explore
            exercises, and get personalized recommendations!
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => navigate("/exercises")}
              className="cursor-pointer"
            >
              <FeatureCard
                title="Exercises & Videos"
                description="Browse exercises with animated demonstrations and form videos"
                icon="🏋️"
              />
            </div>
            {/* <div
              onClick={() => navigate("/body-diagram")}
              className="cursor-pointer"
            >
              <FeatureCard
                title="Body Diagram"
                description="Interactive body diagram to find exercises by muscle"
                icon="🏃"
              />
            </div> */}
            <div onClick={() => navigate("/bmi")} className="cursor-pointer">
              <FeatureCard
                title="BMI Calculator"
                description="Calculate your Body Mass Index and track your health"
                icon="⚖️"
              />
            </div>
            <div onClick={() => navigate("/track-progress")} className="cursor-pointer">
              <FeatureCard
                title="Track Progress"
                description="Log your workouts and track your progress over time"
                icon="📝"
              />
            </div>
            {/* <div onClick={() => navigate("/workout-plans")} className="cursor-pointer">
              <FeatureCard
                title="Workout Plans"
                description="Create custom workout plans tailored to your goals"
                icon="📅"
              />
            </div> */}
            <div onClick={() => navigate("/flex-ai")} className="cursor-pointer">
              <FeatureCard
                title="Flex AI"
                description="AI-powered chatbot for personalized workout recommendations"
                icon="🧠"
              />
            </div>
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
    <div className="bg-gradient-to-br h-full from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100 hover:shadow-lg transition-shadow relative">
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