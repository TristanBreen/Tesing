export type SetLog = {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
};

export type ExerciseLog = {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: SetLog[];
  videoUrl?: string;
  notes?: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  name: string;
  exercises: ExerciseLog[];
  completedAt?: string;
  startTime?: number;
  duration?: number;
  rating?: number;
  generalNotes?: string;
  averageRPE?: number;
  completionRate?: number;
};

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: string;
  defaultSets: number;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Abs' | 'Cardio';

export type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: 'Compound' | 'Isolation' | 'Machine' | 'Bodyweight' | 'Custom';
  defaultSets: number;
  videoUrl?: string;
};

export type Routine = {
  id: string;
  name: string;
  exercises: {
    exerciseId: string;
    targetSets: number;
    targetRepRange: string;
  }[];
};

export type MacroDay = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isRefeed: boolean;
};

export type MealPreset = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type UserGoals = {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
};

export type MuscleRecoveryState = {
  muscleGroup: MuscleGroup;
  lastTrainedDate: string | null;
  hoursSinceTraining: number;
  setsLastSession: number;
  fatigueStatus: 'recovered' | 'recovering' | 'fresh';
  recommendedAction: 'ready' | 'light-only' | 'rest';
};

export type WeeklyVolume = {
  muscleGroup: MuscleGroup;
  setsThisWeek: number;
  recommendedRange: [number, number];
  status: 'undertrained' | 'optimal' | 'overtrained';
};

export type ExerciseProgress = {
  exerciseName: string;
  exerciseId: string;
  last3SessionsVolume: number[];
  trend: 'increasing' | 'plateaued' | 'decreasing';
  recommendation: string;
};

export type UserPreferences = {
  defaultRestTimer: number;
  weightUnit: 'lbs' | 'kg';
  autoStartTimer: boolean;
  enablePRNotifications: boolean;
  minRecoveryHours: number;
  deloadFrequency: number;
};
