import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../../FirebaseConfig';  // Import your Firebase auth
//import { user as FirebaseUser } from 'firebase/auth';
import { type User } from '../types';  // Your own user type
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if there's a user in localStorage or Firebase
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // Load user from localStorage
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // If Firebase user exists, set it to state
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? '',
          username: firebaseUser.email ?? '',
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user)); // Persist user in localStorage
      } else {
        // If no Firebase user, clear state
        setUser(null);
        localStorage.removeItem('user'); // Remove user from localStorage
      }
    });

    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No need to do anything here since Firebase automatically updates auth state
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  
  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // No need to do anything here either, Firebase handles the user creation
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const logout = () => {
    auth.signOut();  // This will trigger onAuthStateChanged to clear user state
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
