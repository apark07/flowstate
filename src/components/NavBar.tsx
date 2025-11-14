import { useNavigate } from "react-router-dom";
import { auth } from "../../FirebaseConfig";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import { type UserData } from "../types/index.ts";

export default function NavBar({pageText}: {pageText: string}) {
  const [user, setUser] = useState<UserData | null>(null);

  const navigate = useNavigate();
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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1
              className="text-2xl font-bold text-indigo-600 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              FlowState
            </h1>
            <span className="text-gray-600">{pageText}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user?.name || "User"}!
            </span>
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
  );
}
