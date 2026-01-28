import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Modal, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAsyncStorage } from './hooks/useAsyncStorage';
import { WorkoutSession, Routine, ExerciseTemplate } from './types';
import { MASTER_EXERCISE_LIST, INITIAL_TEMPLATE_IDS, generateId } from './constants';
import Dashboard from './components/Dashboard';
import ActiveWorkout from './components/ActiveWorkout';
import ScienceTab from './components/Analytics';
import RoutineBuilder from './components/RoutineBuilder';
import NutritionLog from './components/NutritionLog';
import Settings from './components/Settings';

// Icons
import { Home, Dumbbell, Activity, Flame, Settings as SettingsIcon } from './components/Icons';

const Tab = createBottomTabNavigator();

export default function App() {
  const [history, setHistory, historyLoading] = useAsyncStorage<WorkoutSession[]>('hl-history', []);
  const [routines, setRoutines, routinesLoading] = useAsyncStorage<Routine[]>('hl-routines', []);
  const [activeSession, setActiveSession, sessionLoading] = useAsyncStorage<WorkoutSession | null>('hl-active-session', null);
  const [customExercises, setCustomExercises, exercisesLoading] = useAsyncStorage<ExerciseTemplate[]>('hl-custom-exercises', []);
  
  const [showWorkout, setShowWorkout] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const allExercises = React.useMemo(() => {
    return [...MASTER_EXERCISE_LIST, ...customExercises];
  }, [customExercises]);

  const startWorkout = (routine?: Routine) => {
    let exercises: any[] = [];

    if (routine) {
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
      }).filter(Boolean);
    } else {
      exercises = INITIAL_TEMPLATE_IDS.map(id => {
        const def = allExercises.find(e => e.id === id);
        if (!def) return null;
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
      }).filter(Boolean);
    }

    const newSession: WorkoutSession = {
      id: generateId(),
      date: new Date().toISOString(),
      name: routine ? routine.name : "Quick Workout",
      exercises: exercises,
      startTime: Date.now()
    };

    setActiveSession(newSession);
    setShowWorkout(true);
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
      setShowWorkout(false);
      
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  };

  const saveRoutine = (newRoutine: Routine) => {
    setRoutines([...routines, newRoutine]);
    setShowBuilder(false);
  };

  const addCustomExercise = (ex: ExerciseTemplate) => {
    setCustomExercises([...customExercises, ex]);
  };

  const resetData = async () => {
    setHistory([]);
    setRoutines([]);
    setActiveSession(null);
    setCustomExercises([]);
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const deleteSession = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  if (historyLoading || routinesLoading || sessionLoading || exercisesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#06b6d4',
            tabBarInactiveTintColor: '#71717a',
            headerShown: false,
          }}
        >
          <Tab.Screen 
            name="Home" 
            options={{
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
            }}
          >
            {() => (
              <Dashboard 
                history={history}
                routines={routines}
                onStartWorkout={startWorkout}
                onResume={() => setShowWorkout(true)}
                onGoToBuilder={() => setShowBuilder(true)}
                onOpenSettings={() => {}}
                activeSession={activeSession}
                onDeleteRoutine={deleteRoutine}
                onDeleteSession={deleteSession}
                availableExercises={allExercises}
                onSaveRoutine={saveRoutine}
                onAddCustomExercise={addCustomExercise}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Fuel" 
            component={NutritionLog}
            options={{
              tabBarIcon: ({ color, size }) => <Flame color={color} size={size} />
            }}
          />

          <Tab.Screen 
            name="Science" 
            options={{
              tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />
            }}
          >
            {() => <ScienceTab history={history} />}
          </Tab.Screen>

          <Tab.Screen 
            name="Settings"
            options={{
              tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />
            }}
          >
            {() => (
              <Settings 
                onBack={() => {}}
                onReset={resetData}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>

        {/* Workout Modal */}
        <Modal visible={showWorkout} animationType="slide">
          {activeSession && (
            <ActiveWorkout
              session={activeSession}
              history={history}
              onUpdateSession={updateSession}
              onFinish={finishWorkout}
              availableExercises={allExercises}
              onClose={() => setShowWorkout(false)}
            />
          )}
        </Modal>

        {/* Builder Modal */}
        <Modal visible={showBuilder} animationType="slide">
          <RoutineBuilder
            onSave={saveRoutine}
            onCancel={() => setShowBuilder(false)}
            availableExercises={allExercises}
            onAddCustomExercise={addCustomExercise}
          />
        </Modal>

        {/* Confetti Modal */}
        <Modal visible={showConfetti} transparent animationType="fade">
          <View style={styles.confettiContainer}>
            <View style={styles.confettiContent}>
              <Text style={styles.confettiEmoji}>🎉</Text>
              <Text style={styles.confettiTitle}>Workout Complete!</Text>
              <Text style={styles.confettiSubtitle}>Great job adhering to the science.</Text>
            </View>
          </View>
        </Modal>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e4e4e7',
    fontSize: 18,
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: '#18181b',
    borderTopColor: '#27272a',
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  confettiContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContent: {
    alignItems: 'center',
    padding: 40,
  },
  confettiEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  confettiTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  confettiSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
  },
});
