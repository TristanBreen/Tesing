import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Routine, ExerciseTemplate } from '../types';
import { Dumbbell, Plus, Trash, X, Edit } from './Icons';

interface WorkoutLibraryProps {
  routines: Routine[];
  availableExercises: ExerciseTemplate[];
  onStartWorkout: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onEditRoutine: (routine: Routine) => void;
  onAddRoutine: () => void;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({
  routines,
  availableExercises,
  onStartWorkout,
  onDeleteRoutine,
  onEditRoutine,
  onAddRoutine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const filteredRoutines = routines.filter(routine =>
    routine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (routine: Routine) => {
    Alert.alert(
      'Delete Routine',
      `Delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteRoutine(routine.id) },
      ]
    );
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = availableExercises.find(e => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Library</Text>
        <Text style={styles.subtitle}>Your saved workout routines</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search routines..."
          placeholderTextColor="#52525b"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredRoutines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Dumbbell size={48} color="#27272a" />
            <Text style={styles.emptyTitle}>No Routines Yet</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No routines match your search' : 'Create your first workout routine'}
            </Text>
          </View>
        ) : (
          filteredRoutines.map(routine => (
            <View key={routine.id} style={styles.routineCard}>
              <TouchableOpacity
                style={styles.routineMain}
                onPress={() => setSelectedRoutine(routine)}
              >
                <View style={styles.routineHeader}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <View style={styles.routineMeta}>
                    <Text style={styles.routineMetaText}>
                      {routine.exercises.length} exercises
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseList}>
                  {routine.exercises.slice(0, 3).map((ex, idx) => (
                    <Text key={idx} style={styles.exerciseItem}>
                      • {getExerciseName(ex.exerciseId)} ({ex.targetSets} sets)
                    </Text>
                  ))}
                  {routine.exercises.length > 3 && (
                    <Text style={styles.exerciseItem}>
                      +{routine.exercises.length - 3} more
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.routineActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onStartWorkout(routine)}
                >
                  <Text style={styles.actionButtonTextPrimary}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() => onEditRoutine(routine)}
                >
                  <Edit size={16} color="#71717a" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() => handleDelete(routine)}
                >
                  <Trash size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={onAddRoutine}>
        <Plus size={24} color="#000" />
      </TouchableOpacity>

      {/* Routine Detail Modal */}
      <Modal
        visible={selectedRoutine !== null}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedRoutine?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedRoutine(null)}>
                <X size={24} color="#71717a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedRoutine?.exercises.map((ex, idx) => (
                <View key={idx} style={styles.modalExercise}>
                  <Text style={styles.modalExerciseName}>
                    {getExerciseName(ex.exerciseId)}
                  </Text>
                  <Text style={styles.modalExerciseDetail}>
                    {ex.targetSets} sets × {ex.targetRepRange} reps
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  if (selectedRoutine) {
                    onStartWorkout(selectedRoutine);
                    setSelectedRoutine(null);
                  }
                }}
              >
                <Text style={styles.modalActionButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  routineCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  routineMain: {
    padding: 16,
  },
  routineHeader: {
    marginBottom: 12,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  routineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineMetaText: {
    fontSize: 12,
    color: '#71717a',
  },
  exerciseList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  routineActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  actionButtonSecondary: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    padding: 20,
  },
  modalExercise: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e4e4e7',
    marginBottom: 4,
  },
  modalExerciseDetail: {
    fontSize: 13,
    color: '#71717a',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  modalActionButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default WorkoutLibrary;
