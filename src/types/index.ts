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
  id: string;
  userId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  date: string;
}

export interface UserData {
  name: string;
  email: string;
}