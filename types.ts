export type SetLog = {
  id: string;
  weight: number; // 0 if empty
  reps: number; // 0 if empty
  rpe: number; // 1-10, 0 if empty
  completed: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  name: string;
  targetMuscle: string; // e.g. "Quads"
  sets: SetLog[];
  videoUrl?: string; // YouTube search query link
  notes?: string;
};

export type WorkoutSession = {
  id: string;
  date: string; // ISO String
  name: string; // e.g. "Push Hypertrophy"
  exercises: ExerciseLog[];
  completedAt?: string;
};

// Database Types
export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: string;
  defaultSets: number;
}

// --- Workout Builder Types ---
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Abs' | 'Cardio';

export type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: 'Compound' | 'Isolation' | 'Machine' | 'Bodyweight';
  defaultSets: number;
};

export type Routine = {
  id: string;
  name: string; // e.g. "Upper Power"
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetRepRange: string; // "8-12"
  }[];
};

// --- Nutrition Types ---
export type MacroDay = {
  date: string; // ISO
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isRefeed: boolean;
};

export type UserGoals = {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
};