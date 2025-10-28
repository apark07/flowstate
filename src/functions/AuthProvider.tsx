import { useState, type ReactNode } from "react";
import type { User } from "../types/index.ts";
import { AuthContext } from "../contexts/AuthContext";

// // eslint-disable-next-line react-refresh/only-export-components
// export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// // the comment above this line should allow us to export the context without fast refresh errors
// // do not delete the comment!! this is easier (for now) than creating a whole

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    // TODO: Replace with actual backend authentication
    // For now, simulate a successful login
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

    // Mock user data
    const mockUser: User = {
      id: "1",
      email: `${username}@flowstate.com`,
      name: username,
      username: username,
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    // TODO: Replace with actual backend registration
    // For now, simulate a successful registration
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

    const mockUser: User = {
      id: "1",
      email: email,
      name: username,
      username: username,
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
