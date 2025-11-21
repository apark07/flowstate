import { type WorkoutLog } from "../types/index.ts";
import { auth } from "../../FirebaseConfig.ts";

export const mockWorkoutLogs: WorkoutLog[] = [
  {
    user_id: auth.currentUser?.uid || "user1",
    id: "1",
    date: "2025-11-19",
    duration: 45,
    notes: "Upper body day. Did 4 sets of bench press, 3 sets of barbell rows, and some shoulder work. Felt strong today.",
    createdAt: "2025-11-19T10:00:00Z",
  },
  {
    user_id: auth.currentUser?.uid || "user1",
    id: "2",
    date: "2025-11-17",
    duration: 60,
    notes: "Leg day! Squats, leg press, hamstring curls, and calf raises. Legs were burning but good pump.",
    createdAt: "2025-11-17T15:30:00Z",
  },
  {
    user_id: auth.currentUser?.uid || "user1",
    id: "3",
    date: "2025-11-15",
    duration: 30,
    notes: "Quick cardio session - 5 min warm up, 20 min steady state running, 5 min cool down. Felt refreshed.",
    createdAt: "2025-11-15T07:00:00Z",
  },
];
