import React, { useState, useEffect } from 'react';
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
import { WorkoutSession, SetLog, ExerciseTemplate } from '../types';
import { generateId, getWeightRecommendation, calculate1RM, getMax1RM } from '../constants';
import { Plus, X, Check, Trophy, TrendingUp, Timer, Star } from './Icons';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  history: WorkoutSession[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinish: () => void;
  availableExercises: ExerciseTemplate[];
  onClose: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  session,
  history,
  onUpdateSession,
  onFinish,
  availableExercises,
  onClose,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [newPRs, setNewPRs] = useState<string[]>([]);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [swapModalOpen, setSwapModalOpen] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPreviousStats = (exerciseId: string, setIndex: number): string => {
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const pastSession of sortedHistory) {
      if (pastSession.id === session.id) continue;
      const exercise = pastSession.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise && exercise.sets[setIndex]) {
        const s = exercise.sets[setIndex];
        if (s.completed) {
          return `${s.weight}lbs x ${s.reps}`;
        }
      }
    }
    return '-';
  };

  const updateSet = (exerciseIdx: number, setIdx: number, field: keyof SetLog, value: any) => {
    const newExercises = [...session.exercises];
    const currentExercise = newExercises[exerciseIdx];
    const currentSet = currentExercise.sets[setIdx];

    newExercises[exerciseIdx].sets[setIdx] = {
      ...currentSet,
      [field]: value,
    };

    if (field === 'completed' && value === true) {
      checkPR(currentExercise.exerciseId, currentSet.weight, currentSet.reps);
    }

    onUpdateSession({ ...session, exercises: newExercises });
  };

  const checkPR = (exerciseId: string, weight: number, reps: number) => {
    if (!weight || !reps) return;
    const current1RM = calculate1RM(weight, reps);
    const historicalMax = getMax1RM(exerciseId, history);

    if (current1RM > historicalMax && historicalMax > 0) {
      if (!newPRs.includes(exerciseId)) {
        setNewPRs(prev => [...prev, exerciseId]);
      }
    }
  };

  const addSet = (exerciseIdx: number) => {
    const newExercises = [...session.exercises];
    const previousSet =
      newExercises[exerciseIdx].sets[newExercises[exerciseIdx].sets.length - 1];
    newExercises[exerciseIdx].sets.push({
      id: generateId(),
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      rpe: 8,
      completed: false,
    });
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const updateNotes = (exerciseIdx: number, text: string) => {
    const newExercises = [...session.exercises];
    newExercises[exerciseIdx].notes = text;
    onUpdateSession({ ...session, exercises: newExercises });
  };

  const handleFinish = () => {
    onUpdateSession({
      ...session,
      duration: elapsedSeconds,
      rating: rating,
      generalNotes: notes,
    });
    onFinish();
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (showFinishModal) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.finishModal}>
          <View style={styles.finishHeader}>
            <Text style={styles.finishTitle}>Session Complete</Text>
            <TouchableOpacity onPress={() => setShowFinishModal(false)}>
              <X size={24} color="#71717a" />
            </TouchableOpacity>
          </View>

          <View style={styles.finishContent}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>SESSION RATING</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.ratingButton,
                      rating >= r && styles.ratingButtonActive,
                    ]}
                    onPress={() => setRating(r)}
                  >
                    <Star size={24} color={rating >= r ? '#eab308' : '#3f3f46'} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>SESSION NOTES</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="How did it feel? Energy levels? Pain?"
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.durationCard}>
              <Text style={styles.durationLabel}>Duration</Text>
              <Text style={styles.durationValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleFinish}>
              <Text style={styles.saveButtonText}>Save Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{session.name}</Text>
          <View style={styles.timerRow}>
            <Timer size={12} color="#71717a" />
            <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={() => setShowFinishModal(true)}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {session.exercises.map((exercise, exIdx) => {
          const recommendation = getWeightRecommendation(exercise.exerciseId, history);
          const isPRActive = newPRs.includes(exercise.exerciseId);

          return (
            <View
              key={exercise.exerciseId + exIdx}
              style={[
                styles.exerciseCard,
                isPRActive && styles.exerciseCardPR,
              ]}
            >
              {/* Exercise Header */}
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseHeaderLeft}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {isPRActive && <Trophy size={16} color="#eab308" />}
                  </View>
                  <View style={styles.exerciseTags}>
                    <View style={styles.muscleTag}>
                      <Text style={styles.muscleTagText}>{exercise.targetMuscle}</Text>
                    </View>
                    {recommendation && (
                      <View style={styles.recTag}>
                        <TrendingUp size={12} color="#22c55e" />
                        <Text style={styles.recTagText}>+{recommendation}lbs</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Notes */}
              <TextInput
                style={styles.notesTextInput}
                value={exercise.notes || ''}
                onChangeText={text => updateNotes(exIdx, text)}
                placeholder="Add exercise notes..."
                placeholderTextColor="#52525b"
                multiline
              />

              {/* Sets Header */}
              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>#</Text>
                <Text style={[styles.setsHeaderText, { flex: 1 }]}>LBS</Text>
                <Text style={[styles.setsHeaderText, { flex: 1 }]}>REPS</Text>
                <Text style={[styles.setsHeaderText, { flex: 0.6 }]}>RPE</Text>
                <Text style={[styles.setsHeaderText, { width: 32 }]}></Text>
              </View>

              {/* Sets */}
              {exercise.sets.map((set, setIdx) => {
                const prevData = getPreviousStats(exercise.exerciseId, setIdx);
                return (
                  <View
                    key={set.id}
                    style={[styles.setRow, set.completed && styles.setRowCompleted]}
                  >
                    <View style={styles.setNumber}>
                      <Text style={styles.setNumberText}>{setIdx + 1}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, set.completed && styles.inputCompleted]}
                        value={set.weight ? set.weight.toString() : ''}
                        onChangeText={text =>
                          updateSet(exIdx, setIdx, 'weight', parseFloat(text) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#52525b"
                      />
                      <Text style={styles.ghostText}>{prevData.split('x')[0]}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, set.completed && styles.inputCompleted]}
                        value={set.reps ? set.reps.toString() : ''}
                        onChangeText={text =>
                          updateSet(exIdx, setIdx, 'reps', parseFloat(text) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#52525b"
                      />
                      <Text style={styles.ghostText}>
                        {prevData.includes('x') ? prevData.split('x')[1] : '-'}
                      </Text>
                    </View>

                    <TextInput
                      style={[styles.inputSmall, set.completed && styles.inputCompleted]}
                      value={set.rpe ? set.rpe.toString() : ''}
                      onChangeText={text =>
                        updateSet(exIdx, setIdx, 'rpe', parseFloat(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholder="8"
                      placeholderTextColor="#52525b"
                      maxLength={2}
                    />

                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        set.completed && styles.checkButtonCompleted,
                      ]}
                      onPress={() =>
                        updateSet(exIdx, setIdx, 'completed', !set.completed)
                      }
                    >
                      <Check size={20} color={set.completed ? '#000' : '#52525b'} />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Add Set Button */}
              <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exIdx)}>
                <Plus size={16} color="#71717a" />
                <Text style={styles.addSetText}>ADD SET</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#71717a" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  finishButton: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  finishButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.5)',
    padding: 4,
    marginBottom: 24,
  },
  exerciseCardPR: {
    borderColor: 'rgba(234, 179, 8, 0.5)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  muscleTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleTagText: {
    fontSize: 10,
    color: '#8b5cf6',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  recTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  recTagText: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  notesTextInput: {
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    color: '#d4d4d8',
    fontSize: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    minHeight: 36,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 8,
  },
  setsHeaderText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: 32,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  setRowCompleted: {
    opacity: 0.5,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a1a1aa',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputCompleted: {
    color: '#71717a',
  },
  inputSmall: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    textAlign: 'center',
    flex: 0.6,
  },
  ghostText: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    fontSize: 9,
    color: '#52525b',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#06b6d4',
  },
  addSetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 8,
  },
  addSetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishModal: {
    flex: 1,
    padding: 24,
  },
  finishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  finishTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  finishContent: {
    gap: 24,
  },
  ratingSection: {
    gap: 12,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: '#eab308',
  },
  notesSection: {
    gap: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notesInput: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    minHeight: 128,
    textAlignVertical: 'top',
  },
  durationCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ActiveWorkout;
