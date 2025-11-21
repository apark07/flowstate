export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

export interface WorkoutLog {
  user_id: string;
  id: string;
  date: string;
  duration: number; // in minutes
  notes: string;
  createdAt: string;
}

export interface UserData {
  name: string;
  email: string;
  createdAt?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  duration: number; // in minutes
  notes: string;
  createdAt: string;
}