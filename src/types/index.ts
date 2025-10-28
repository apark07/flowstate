export type User =  {
  id: string;
  email: string;
  name: string;
  username: string;
}

export type Exercise =  {
  id: string;
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

export type WorkoutLog = {
  id: string;
  userId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  date: string;
}
export type AuthContextType ={
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}