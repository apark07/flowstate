import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../../FirebaseConfig.ts';

interface BMIRecord {
  id: string;
  date: string;
  bmi: number;
  category: string;
  unit: 'metric' | 'imperial';
  height: number;
  weight: number;
}

export default function BMICalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Unit toggle
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  
  // Metric inputs
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  
  // Imperial inputs
  const [heightFeet, setHeightFeet] = useState<string>('');
  const [heightInches, setHeightInches] = useState<string>('');
  const [weightLbs, setWeightLbs] = useState<string>('');
  
  // Results
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [history, setHistory] = useState<BMIRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bmiHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  // Calculate BMI in real-time
  useEffect(() => {
    calculateBMI();
  }, [heightCm, weightKg, heightFeet, heightInches, weightLbs, unit]);

  const calculateBMI = () => {
    let bmiValue: number | null = null;

    if (unit === 'metric') {
      const height = parseFloat(heightCm);
      const weight = parseFloat(weightKg);
      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        bmiValue = weight / (heightInMeters * heightInMeters);
      }
    } else {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      const weight = parseFloat(weightLbs);
      const totalInches = feet * 12 + inches;
      
      if (totalInches > 0 && weight > 0) {
        bmiValue = (weight / (totalInches * totalInches)) * 703;
      }
    }

    if (bmiValue) {
      setBmi(parseFloat(bmiValue.toFixed(1)));
      setCategory(getBMICategory(bmiValue));
    } else {
      setBmi(null);
      setCategory('');
    }
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Underweight': return 'text-blue-600 bg-blue-50';
      case 'Normal weight': return 'text-green-600 bg-green-50';
      case 'Overweight': return 'text-yellow-600 bg-yellow-50';
      case 'Obese': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const saveToHistory = () => {
    if (!bmi) return;

    const record: BMIRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      bmi,
      category,
      unit,
      height: unit === 'metric' ? parseFloat(heightCm) : (parseFloat(heightFeet) * 12 + parseFloat(heightInches)),
      weight: unit === 'metric' ? parseFloat(weightKg) : parseFloat(weightLbs),
    };

    const updatedHistory = [record, ...history].slice(0, 10); // Keep last 10 records
    setHistory(updatedHistory);
    localStorage.setItem('bmiHistory', JSON.stringify(updatedHistory));
  };

  const getBMIGaugePosition = (bmi: number): number => {
    // Map BMI to percentage (0-100) for gauge
    // Range: 15 to 35
    const min = 15;
    const max = 35;
    const clamped = Math.max(min, Math.min(max, bmi));
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 
                className="text-2xl font-bold text-indigo-600 cursor-pointer"
                onClick={() => navigate('/home')}
              >
                FlowState
              </h1>
              <span className="text-gray-600">BMI Calculator</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.username || user?.name}!</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculate Your BMI</h2>

              {/* Unit Toggle */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-xs">
                <button
                  onClick={() => setUnit('imperial')}
                  className={`flex-1 py-2 px-4 rounded-md transition-all ${
                    unit === 'imperial'
                      ? 'bg-white text-indigo-600 shadow-sm font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
                <button
                  onClick={() => setUnit('metric')}
                  className={`flex-1 py-2 px-4 rounded-md transition-all ${
                    unit === 'metric'
                      ? 'bg-white text-indigo-600 shadow-sm font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  Metric (kg/cm)
                </button>
              </div>

              {/* Input Form */}
              <div className="space-y-6">
                {unit === 'metric' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="e.g., 175"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="e.g., 70"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => setHeightFeet(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Feet"
                          />
                          <span className="text-xs text-gray-500 mt-1">feet</span>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => setHeightInches(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Inches"
                          />
                          <span className="text-xs text-gray-500 mt-1">inches</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="e.g., 154"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* BMI Result */}
              {bmi && (
                <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Your BMI</h3>
                    <div className="text-5xl font-bold text-indigo-600 mb-2">{bmi}</div>
                    <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getCategoryColor(category)}`}>
                      {category}
                    </div>
                  </div>

                  {/* BMI Gauge */}
                  <div className="mt-6">
                    <div className="h-3 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-gray-800 rounded-full shadow-lg"
                        style={{ left: `${getBMIGaugePosition(bmi)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>35</span>
                    </div>
                  </div>

                  <button
                    onClick={saveToHistory}
                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Save to History
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History & Info Section */}
          <div className="space-y-6">
            {/* BMI Categories Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Categories</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="font-medium">Underweight:</span>
                  <span className="text-gray-600">&lt; 18.5</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="font-medium">Normal:</span>
                  <span className="text-gray-600">18.5 - 24.9</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="font-medium">Overweight:</span>
                  <span className="text-gray-600">25 - 29.9</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="font-medium">Obese:</span>
                  <span className="text-gray-600">≥ 30</span>
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>
                <div className="space-y-3">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="border-l-4 border-indigo-400 pl-4 py-2 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">{record.bmi}</div>
                          <div className="text-xs text-gray-600">{record.category}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}