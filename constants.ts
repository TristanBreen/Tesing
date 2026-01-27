import { ExerciseTemplate, UserGoals } from './types';

// --- Data ---

export const MASTER_EXERCISE_LIST: ExerciseTemplate[] = [
  // Chest
  { id: 'bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', type: 'Compound', defaultSets: 3 },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', type: 'Compound', defaultSets: 3 },
  { id: 'pec-deck', name: 'Pec Deck Machine', muscleGroup: 'Chest', type: 'Isolation', defaultSets: 3 },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroup: 'Chest', type: 'Isolation', defaultSets: 3 },
  
  // Back
  { id: 'pull-up', name: 'Pull Up', muscleGroup: 'Back', type: 'Bodyweight', defaultSets: 3 },
  { id: 'lat-pulldown-kelso', name: 'Lat Pulldown (Kelso)', muscleGroup: 'Back', type: 'Machine', defaultSets: 3 },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'Back', type: 'Compound', defaultSets: 3 },
  { id: 'chest-supported-row', name: 'Chest Supported Row', muscleGroup: 'Back', type: 'Machine', defaultSets: 3 },
  
  // Legs
  { id: 'squat', name: 'Barbell Squat', muscleGroup: 'Legs', type: 'Compound', defaultSets: 3 },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroup: 'Legs', type: 'Machine', defaultSets: 3 },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', type: 'Machine', defaultSets: 3 },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', type: 'Compound', defaultSets: 3 },
  { id: 'leg-curl', name: 'Seated Leg Curl', muscleGroup: 'Legs', type: 'Isolation', defaultSets: 3 },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'Legs', type: 'Isolation', defaultSets: 3 },
  { id: 'calf-raise', name: 'Standing Calf Raise', muscleGroup: 'Legs', type: 'Isolation', defaultSets: 4 },

  // Shoulders
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'Shoulders', type: 'Compound', defaultSets: 3 },
  { id: 'db-shoulder-press', name: 'DB Shoulder Press', muscleGroup: 'Shoulders', type: 'Compound', defaultSets: 3 },
  { id: 'cable-lat-raise', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', type: 'Isolation', defaultSets: 4 },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Shoulders', type: 'Isolation', defaultSets: 3 },

  // Arms
  { id: 'bicep-curl', name: 'Barbell Curl', muscleGroup: 'Arms', type: 'Isolation', defaultSets: 3 },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms', type: 'Isolation', defaultSets: 3 },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'Arms', type: 'Isolation', defaultSets: 3 },
  { id: 'skullcrusher', name: 'Skullcrusher', muscleGroup: 'Arms', type: 'Isolation', defaultSets: 3 },
  
  // Abs
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abs', type: 'Isolation', defaultSets: 3 },
  { id: 'leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Abs', type: 'Bodyweight', defaultSets: 3 },
];

export const INITIAL_TEMPLATE_IDS = [
  'squat',
  'bench-press',
  'barbell-row',
  'ohp',
  'rdl'
];

export const DEFAULT_GOALS: UserGoals = {
  dailyCalories: 2500,
  dailyProtein: 180,
  dailyCarbs: 250,
  dailyFats: 70
};

// Compatibility for existing code that uses EXERCISE_DB
// We map the new structure to the old one where necessary, but mostly they are compatible
export const EXERCISE_DB = MASTER_EXERCISE_LIST.map(e => ({
    id: e.id,
    name: e.name,
    targetMuscle: e.muscleGroup,
    defaultSets: e.defaultSets
}));

// --- Science Utils ---

// Epley Formula: w * (1 + r/30)
export const calculate1RM = (weight: number, reps: number): number => {
  if (weight === 0 || reps === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export const calculateVolumeLoad = (weight: number, reps: number): number => {
  return weight * reps;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);