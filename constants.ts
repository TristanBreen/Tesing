import { ExerciseTemplate, UserGoals, WorkoutSession, MuscleGroup, MuscleRecoveryState, WeeklyVolume, ExerciseProgress } from './types';

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

export const EXERCISE_DB = MASTER_EXERCISE_LIST.map(e => ({
    id: e.id,
    name: e.name,
    targetMuscle: e.muscleGroup,
    defaultSets: e.defaultSets
}));

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

export const getWeightRecommendation = (exerciseId: string, history: WorkoutSession[]): number | null => {
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastSession = sortedHistory.find(s => s.exercises.some(e => e.exerciseId === exerciseId));
  
  if (!lastSession) return null;

  const exerciseLog = lastSession.exercises.find(e => e.exerciseId === exerciseId);
  if (!exerciseLog) return null;

  const validSets = exerciseLog.sets.filter(s => s.weight > 0 && s.reps > 0);
  if (validSets.length === 0) return null;

  const allCompleted = validSets.every(s => s.completed);
  const avgRPE = validSets.reduce((acc, s) => acc + (s.rpe || 0), 0) / validSets.length;

  if (allCompleted && avgRPE < 8) {
     const def = MASTER_EXERCISE_LIST.find(e => e.id === exerciseId);
     const increment = (def?.type === 'Compound' || def?.type === 'Machine') ? 5 : 2.5; 
     return increment;
  }
  return null;
};

export const getMax1RM = (exerciseId: string, history: WorkoutSession[]): number => {
  let max = 0;
  history.forEach(session => {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId);
    if (ex) {
      ex.sets.forEach(s => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          const rm = calculate1RM(s.weight, s.reps);
          if (rm > max) max = rm;
        }
      });
    }
  });
  return max;
};

export const calculateMuscleRecovery = (
  history: WorkoutSession[],
  muscleGroup: MuscleGroup
): MuscleRecoveryState => {
  const relevantSessions = [...history]
    .filter(s => s.exercises.some(e => e.targetMuscle === muscleGroup))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (relevantSessions.length === 0) {
    return {
      muscleGroup,
      lastTrainedDate: null,
      hoursSinceTraining: Infinity,
      setsLastSession: 0,
      fatigueStatus: 'fresh',
      recommendedAction: 'ready'
    };
  }

  const lastSession = relevantSessions[0];
  const hoursSince = (Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60);
  const setsCount = lastSession.exercises
    .filter(e => e.targetMuscle === muscleGroup)
    .reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0);

  let fatigueStatus: 'recovered' | 'recovering' | 'fresh';
  let recommendedAction: 'ready' | 'light-only' | 'rest';

  if (hoursSince < 24) {
    fatigueStatus = 'recovering';
    recommendedAction = 'rest';
  } else if (hoursSince < 48) {
    fatigueStatus = 'recovering';
    recommendedAction = 'light-only';
  } else if (hoursSince < 168) {
    fatigueStatus = 'recovered';
    recommendedAction = 'ready';
  } else {
    fatigueStatus = 'fresh';
    recommendedAction = 'ready';
  }

  return {
    muscleGroup,
    lastTrainedDate: lastSession.date,
    hoursSinceTraining: Math.round(hoursSince),
    setsLastSession: setsCount,
    fatigueStatus,
    recommendedAction
  };
};

export const calculateWeeklyVolume = (
  history: WorkoutSession[],
  muscleGroup: MuscleGroup
): WeeklyVolume => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = history.filter(
    s => new Date(s.date).getTime() > sevenDaysAgo
  );

  const totalSets = recentSessions.reduce((acc, session) => {
    const muscleSets = session.exercises
      .filter(e => e.targetMuscle === muscleGroup)
      .reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0);
    return acc + muscleSets;
  }, 0);

  const ranges: Record<string, [number, number]> = {
    'Chest': [10, 20],
    'Back': [10, 20],
    'Legs': [10, 20],
    'Shoulders': [8, 16],
    'Arms': [8, 16],
    'Abs': [6, 12],
    'Cardio': [0, 999]
  };

  const range = ranges[muscleGroup] || [10, 20];
  let status: 'undertrained' | 'optimal' | 'overtrained';

  if (totalSets < range[0]) status = 'undertrained';
  else if (totalSets > range[1]) status = 'overtrained';
  else status = 'optimal';

  return {
    muscleGroup,
    setsThisWeek: totalSets,
    recommendedRange: range,
    status
  };
};

export const analyzeExerciseProgress = (
  history: WorkoutSession[],
  exerciseId: string
): ExerciseProgress | null => {
  const sessions = [...history]
    .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (sessions.length < 2) return null;

  const volumes = sessions.reverse().map(session => {
    const exercise = session.exercises.find(e => e.exerciseId === exerciseId)!;
    return exercise.sets
      .filter(s => s.completed)
      .reduce((sum, s) => sum + calculateVolumeLoad(s.weight, s.reps), 0);
  });

  let trend: 'increasing' | 'plateaued' | 'decreasing';
  if (volumes.every((v, i) => i === 0 || v >= volumes[i - 1])) {
    trend = 'increasing';
  } else if (volumes[volumes.length - 1] === volumes[volumes.length - 2]) {
    trend = 'plateaued';
  } else {
    trend = 'decreasing';
  }

  let recommendation = '';
  if (trend === 'increasing') recommendation = 'Great! Try +5lbs next session';
  else if (trend === 'plateaued') recommendation = 'Add 1 rep per set or increase weight';
  else recommendation = 'Consider reducing volume or taking a deload';

  const exerciseName = sessions[0].exercises.find(e => e.exerciseId === exerciseId)?.name || 'Unknown Exercise';

  return {
    exerciseName,
    exerciseId,
    last3SessionsVolume: volumes,
    trend,
    recommendation
  };
};
