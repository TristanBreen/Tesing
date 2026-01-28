import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSession, Routine } from '../types';
import { formatDate } from '../constants';
import { Plus, Dumbbell, Trash, X } from './Icons';

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
}

const Dashboard: React.FC<DashboardProps> = ({
  history,
  routines,
  onStartWorkout,
  onResume,
  onGoToBuilder,
  activeSession,
  onDeleteRoutine,
  onDeleteSession
}) => {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to the Lab.</Text>
          </View>
        </View>

        {/* Active Session or Builder */}
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
          <TouchableOpacity style={styles.builderCard} onPress={onGoToBuilder}>
            <View style={styles.builderIcon}>
              <Plus size={24} color="#06b6d4" />
            </View>
            <View style={styles.builderText}>
              <Text style={styles.builderTitle}>Builder</Text>
              <Text style={styles.builderSubtitle}>Create New Routine</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Saved Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR ROUTINES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routinesScroll}>
            {routines.map(routine => (
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
              <Text style={styles.emptyText}>No routines saved. Use the Builder!</Text>
            )}
          </ScrollView>
        </View>

        {/* Recent Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT LOGS</Text>
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
    marginTop: 8,
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
  builderCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  builderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  builderText: {
    flex: 1,
  },
  builderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  builderSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    marginBottom: 12,
    letterSpacing: 1,
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
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    fontStyle: 'italic',
    padding: 8,
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
