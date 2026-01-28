import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSession, Routine, ExerciseTemplate } from '../types';
import { formatDate } from '../constants';
import { Plus, Dumbbell, Trash, X, BookOpen } from './Icons';
import WorkoutLibrary from './WorkoutLibrary';
import RoutineBuilder from './RoutineBuilder';

interface DashboardProps {
  history: WorkoutSession[];
  routines: Routine[];
  onStartWorkout: (routine?: Routine) => void;
  onResume: () => void;
  onGoToBuilder: () => void;
  onOpenSettings: () => void;
  activeSession: WorkoutSession | null;
  onDeleteRoutine: (id: string) => void;
  onDeleteSession: (id: string) => void;
  availableExercises: ExerciseTemplate[];
  onSaveRoutine: (routine: Routine) => void;
  onAddCustomExercise: (ex: ExerciseTemplate) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  history,
  routines,
  onStartWorkout,
  onResume,
  onGoToBuilder,
  activeSession,
  onDeleteRoutine,
  onDeleteSession,
  availableExercises,
  onSaveRoutine,
  onAddCustomExercise,
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const handleDeleteRoutine = (id: string, name: string) => {
    Alert.alert(
      'Delete Routine',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteRoutine(id) }
      ]
    );
  };

  const handleDeleteSession = (id: string, name: string) => {
    Alert.alert(
      'Delete Workout',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteSession(id) }
      ]
    );
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setShowLibrary(false);
    setShowBuilder(true);
  };

  const handleSaveRoutine = (routine: Routine) => {
    onSaveRoutine(routine);
    setShowBuilder(false);
    setEditingRoutine(null);
  };

  if (showLibrary) {
    return (
      <WorkoutLibrary
        routines={routines}
        availableExercises={availableExercises}
        onStartWorkout={onStartWorkout}
        onDeleteRoutine={onDeleteRoutine}
        onEditRoutine={handleEditRoutine}
        onAddRoutine={() => {
          setShowLibrary(false);
          setShowBuilder(true);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to the Lab.</Text>
          </View>
          <TouchableOpacity
            style={styles.libraryButton}
            onPress={() => setShowLibrary(true)}
          >
            <BookOpen size={20} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {/* Active Session or Quick Start */}
        {activeSession ? (
          <View style={styles.activeCard}>
            <View style={styles.activeCardInner}>
              <Text style={styles.activeTitle}>Session in Progress</Text>
              <Text style={styles.activeSubtitle}>Continuing {activeSession.name}...</Text>
              <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
                <Text style={styles.resumeButtonText}>▶ Resume Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.quickStartCard} onPress={() => onStartWorkout()}>
            <View style={styles.quickStartIcon}>
              <Dumbbell size={32} color="#06b6d4" />
            </View>
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitle}>Quick Start</Text>
              <Text style={styles.quickStartSubtitle}>Begin an empty workout</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Saved Routines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
            <TouchableOpacity onPress={() => setShowLibrary(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routinesScroll}>
            {routines.slice(0, 5).map(routine => (
              <View key={routine.id} style={styles.routineCard}>
                <TouchableOpacity
                  style={styles.routineDeleteButton}
                  onPress={() => handleDeleteRoutine(routine.id, routine.name)}
                >
                  <X size={16} color="#71717a" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.routineContent}
                  onPress={() => onStartWorkout(routine)}
                >
                  <View style={styles.routineIconContainer}>
                    <Dumbbell size={16} color="#71717a" />
                  </View>
                  <Text style={styles.routineName} numberOfLines={1}>{routine.name}</Text>
                  <Text style={styles.routineInfo}>{routine.exercises.length} Exercises</Text>
                </TouchableOpacity>
              </View>
            ))}
            {routines.length === 0 && (
              <TouchableOpacity
                style={styles.emptyRoutineCard}
                onPress={() => {
                  setShowLibrary(false);
                  setShowBuilder(true);
                }}
              >
                <Plus size={24} color="#06b6d4" />
                <Text style={styles.emptyText}>Create your first routine</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Recent Logs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT LOGS</Text>
          </View>
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No history found. Start lifting!</Text>
            </View>
          ) : (
            [...history].reverse().slice(0, 5).map(session => (
              <View key={session.id} style={styles.logCard}>
                <View style={styles.logInfo}>
                  <Text style={styles.logName}>{session.name}</Text>
                  <Text style={styles.logDetails}>
                    {formatDate(session.date)} • {session.exercises.length} Exercises
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSession(session.id, session.name)}
                  style={styles.deleteButton}
                >
                  <Trash size={20} color="#71717a" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Builder Modal */}
      <Modal visible={showBuilder} animationType="slide">
        <RoutineBuilder
          onSave={handleSaveRoutine}
          onCancel={() => {
            setShowBuilder(false);
            setEditingRoutine(null);
          }}
          availableExercises={availableExercises}
          onAddCustomExercise={onAddCustomExercise}
          editingRoutine={editingRoutine}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
  },
  libraryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 24,
    padding: 1,
    marginBottom: 16,
  },
  activeCardInner: {
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    borderRadius: 23,
    padding: 24,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  activeSubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 24,
  },
  resumeButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickStartCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quickStartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickStartText: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickStartSubtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
  },
  routinesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  routineCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 160,
    position: 'relative',
  },
  routineDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineContent: {
    paddingTop: 8,
  },
  routineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
    marginBottom: 4,
  },
  routineInfo: {
    fontSize: 12,
    color: '#71717a',
  },
  emptyRoutineCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
  },
  logCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 12,
    color: '#71717a',
  },
  deleteButton: {
    padding: 8,
  },
});

export default Dashboard;
