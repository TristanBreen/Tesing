import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { WorkoutSession, ExerciseLog, Routine, ExerciseTemplate } from './types';
import { MASTER_EXERCISE_LIST, INITIAL_TEMPLATE_IDS, generateId } from './constants';
import Dashboard from './components/Dashboard';
import ActiveWorkout from './components/ActiveWorkout';
import ScienceTab from './components/Analytics'; // Renamed import for clarity, file is still Analytics.tsx
import RoutineBuilder from './components/RoutineBuilder';
import NutritionLog from './components/NutritionLog';
import Settings from './components/Settings';
import { LayoutDashboard, Dumbbell, Activity, Flame, PartyPopper, PlusCircle, Settings as SettingsIcon } from 'lucide-react';

type ViewState = 'dashboard' | 'workout' | 'builder' | 'fuel' | 'analytics' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [history, setHistory] = useLocalStorage<WorkoutSession[]>('hl-history', []);
  const [routines, setRoutines] = useLocalStorage<Routine[]>('hl-routines', []);
  const [activeSession, setActiveSession] = useLocalStorage<WorkoutSession | null>('hl-active-session', null);
  const [customExercises, setCustomExercises] = useLocalStorage<ExerciseTemplate[]>('hl-custom-exercises', []);
  const [showConfetti, setShowConfetti] = useState(false);

  // Combine Master + Custom
  const allExercises = useMemo(() => {
      return [...MASTER_EXERCISE_LIST, ...customExercises];
  }, [customExercises]);

  // --- Actions ---

  const startWorkout = (routine?: Routine) => {
    let exercises: ExerciseLog[] = [];

    if (routine) {
        // Build from Routine
        exercises = routine.exercises.map(exDef => {
            const template = allExercises.find(e => e.id === exDef.exerciseId);
            if (!template) return null;
            return {
                exerciseId: template.id,
                name: template.name,
                targetMuscle: template.muscleGroup,
                sets: Array.from({ length: exDef.targetSets }).map(() => ({
                    id: generateId(),
                    weight: 0,
                    reps: 0,
                    rpe: 8,
                    completed: false
                }))
            };
        }).filter(Boolean) as ExerciseLog[];
    } else {
        // Default Template (Fallback)
        exercises = INITIAL_TEMPLATE_IDS.map(id => {
          const def = allExercises.find(e => e.id === id);
          if(!def) return null;
          return {
            exerciseId: def.id,
            name: def.name,
            targetMuscle: def.muscleGroup,
            sets: Array.from({ length: def.defaultSets }).map(() => ({
              id: generateId(),
              weight: 0,
              reps: 0,
              rpe: 8,
              completed: false
            }))
          };
        }).filter(Boolean) as ExerciseLog[];
    }

    const newSession: WorkoutSession = {
      id: generateId(),
      date: new Date().toISOString(),
      name: routine ? routine.name : "Quick Workout",
      exercises: exercises,
      startTime: Date.now()
    };

    setActiveSession(newSession);
    setActiveView('workout');
  };

  const updateSession = (updated: WorkoutSession) => {
    setActiveSession(updated);
  };

  const finishWorkout = () => {
    if (activeSession) {
      const completedSession = {
        ...activeSession,
        completedAt: new Date().toISOString()
      };
      setHistory([...history, completedSession]);
      setActiveSession(null);
      
      // Confetti Effect
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setActiveView('dashboard');
      }, 3000);
    }
  };

  const saveRoutine = (newRoutine: Routine) => {
      setRoutines([...routines, newRoutine]);
      setActiveView('dashboard');
  };

  const addCustomExercise = (ex: ExerciseTemplate) => {
      setCustomExercises([...customExercises, ex]);
  };
  
  const resetData = () => {
      if(window.confirm('Are you sure you want to wipe all data? This cannot be undone.')) {
          setHistory([]);
          setRoutines([]);
          setActiveSession(null);
          setCustomExercises([]);
          window.localStorage.removeItem('hl-nutrition-logs');
          window.localStorage.removeItem('hl-user-preferences');
          alert('All data reset.');
          setActiveView('dashboard');
      }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-primary/30">
      
      {/* Content Area */}
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl shadow-black/50 bg-background overflow-hidden">
        {activeView === 'dashboard' && (
          <Dashboard 
            history={history} 
            routines={routines}
            onStartWorkout={startWorkout}
            onResume={() => setActiveView('workout')}
            onGoToBuilder={() => setActiveView('builder')}
            onOpenSettings={() => setActiveView('settings')}
            activeSession={activeSession}
          />
        )}
        
        {activeView === 'workout' && activeSession && (
          <ActiveWorkout 
            session={activeSession}
            history={history}
            onUpdateSession={updateSession}
            onFinish={finishWorkout}
            availableExercises={allExercises}
          />
        )}

        {activeView === 'builder' && (
            <RoutineBuilder 
                onSave={saveRoutine}
                onCancel={() => setActiveView('dashboard')}
                availableExercises={allExercises}
                onAddCustomExercise={addCustomExercise}
            />
        )}

        {activeView === 'fuel' && (
          <NutritionLog />
        )}

        {activeView === 'analytics' && (
          <ScienceTab history={history} />
        )}

        {activeView === 'settings' && (
            <Settings 
                onBack={() => setActiveView('dashboard')}
                onReset={resetData}
            />
        )}
        
        {/* Navigation Bar - Hide on Workout, Builder to focus */}
        {activeView !== 'workout' && activeView !== 'builder' && (
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-zinc-800 pb-safe">
                <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
                    <NavButton 
                        active={activeView === 'dashboard'} 
                        onClick={() => setActiveView('dashboard')} 
                        icon={LayoutDashboard} 
                        label="Home" 
                    />
                     <NavButton 
                        active={activeView === 'fuel'} 
                        onClick={() => setActiveView('fuel')} 
                        icon={Flame} 
                        label="Fuel" 
                    />
                    <div className="relative -top-5">
                         <button 
                            onClick={() => {
                                if(activeSession) setActiveView('workout');
                                else setActiveView('builder');
                            }}
                            className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 border-4 border-background"
                        >
                            {activeSession ? <Dumbbell className="w-6 h-6 animate-pulse" /> : <PlusCircle className="w-8 h-8" />}
                        </button>
                    </div>
                    <NavButton 
                        active={activeView === 'analytics'} 
                        onClick={() => setActiveView('analytics')} 
                        icon={Activity} 
                        label="Science" 
                    />
                    <NavButton 
                        active={activeView === 'settings'} 
                        onClick={() => setActiveView('settings')} 
                        icon={SettingsIcon} 
                        label="Settings" 
                    />
                </div>
            </nav>
        )}
      </main>

      {/* Confetti Modal Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="text-center scale-110 animate-pulse">
                <PartyPopper className="w-24 h-24 text-primary mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-white mb-2">Workout Complete!</h2>
                <p className="text-zinc-400">Great job adhering to the science.</p>
            </div>
        </div>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-full space-y-1 transition-all duration-200 ${active ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
        <Icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);