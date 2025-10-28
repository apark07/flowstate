import { createContext } from "react";

import type { User } from "../types/index.ts";

export type AuthContextType = {
  user: User | null;

  login: (username: string, password: string) => Promise<void>;

  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
