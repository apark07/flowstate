import { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../FirebaseConfig.ts';
import { doc, setDoc } from 'firebase/firestore';
import { type UserData } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth()!;

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const response = await login(email, password);

        if (!response!) { 
          setError('Login failed. Please check your credentials and try again.');
          return;
        }
        console.log("Login successful");
      } else {
        if (!username) {
          setError('Username is required for registration');
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          setError('Please enter a valid email address');
          return;
        }

        if (password.length < 7) {
          setError('Password must be at least 7 characters long');
          return;
        }

        // Perform registration
        await register(email, password);
        console.log("Registration successful");

        const userId = auth.currentUser?.uid;
        if (!userId) {
          setError('User ID not found after registration. Try refreshing the page.');
          return;
        }

        // There is a 'user' collection in Firestore where we store user info. Current fields are name and email.
        // More may be added later
        const userLoginData: UserData = {
          name: username,
          email: email,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', userId), userLoginData);
      }
      // do not do navigate('/home') here because the auth state listener in App.tsx will handle the redirect
    } catch (err) {
      console.log("reached seterror");
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">FlowState</h1>
          <p className="text-gray-600">Your fitness journey starts here</p>
        </div>

        {/* Toggle between Login/Register */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-all ${
              isLogin
                ? "bg-white text-indigo-600 shadow-sm font-medium"
                : "text-gray-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-all ${
              !isLogin
                ? "bg-white text-indigo-600 shadow-sm font-medium"
                : "text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username only shown during registration */}
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>
          )}

          {/* Email always shown for both login and registration */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Re-enter your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
