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
import { generateId } from '../constants';
import { Routine, ExerciseTemplate, MuscleGroup } from '../types';
import { Plus, Save, Trash, X } from './Icons';

interface RoutineBuilderProps {
  onSave: (routine: Routine) => void;
  onCancel: () => void;
  availableExercises: ExerciseTemplate[];
  onAddCustomExercise: (ex: ExerciseTemplate) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  onSave,
  onCancel,
  availableExercises,
  onAddCustomExercise,
}) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<
    {
      uniqueId: string;
      template: ExerciseTemplate;
      targetSets: number;
      targetRepRange: string;
    }[]
  >([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');

  const addExercise = (template: ExerciseTemplate) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        uniqueId: generateId(),
        template,
        targetSets: template.defaultSets,
        targetRepRange: '8-12',
      },
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    const newEx = [...selectedExercises];
    newEx.splice(index, 1);
    setSelectedExercises(newEx);
  };

  const updateExerciseConfig = (
    index: number,
    field: 'targetSets' | 'targetRepRange',
    value: any
  ) => {
    const newEx = [...selectedExercises];
    newEx[index] = { ...newEx[index], [field]: value };
    setSelectedExercises(newEx);
  };

  const handleSave = () => {
    if (!routineName) {
      Alert.alert('Error', 'Please name your routine');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Add at least one exercise');
      return;
    }

    const routine: Routine = {
      id: generateId(),
      name: routineName,
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.template.id,
        targetSets: ex.targetSets,
        targetRepRange: ex.targetRepRange,
      })),
    };
    onSave(routine);
  };

  const handleCreateCustom = () => {
    if (!customName) return;
    const newEx: ExerciseTemplate = {
      id: `custom-${generateId()}`,
      name: customName,
      muscleGroup: customMuscle,
      type: 'Custom',
      defaultSets: 3,
    };
    onAddCustomExercise(newEx);
    setCustomName('');
    setIsCustomModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Lab Builder</Text>
          <Text style={styles.headerSubtitle}>Design your hypertrophy block</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={16} color="#000" />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Routine Name */}
        <TextInput
          style={styles.nameInput}
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Routine Name (e.g. Leg Day A)"
          placeholderTextColor="#52525b"
        />

        {/* Selected Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROUTINE SEQUENCE</Text>
          {selectedExercises.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Tap the + button below to add exercises</Text>
            </View>
          ) : (
            selectedExercises.map((item, index) => (
              <View key={item.uniqueId} style={styles.exerciseCard}>
                <View style={styles.exerciseCardContent}>
                  <Text style={styles.exerciseName}>{item.template.name}</Text>
                  <View style={styles.exerciseConfig}>
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>SETS</Text>
                      <TextInput
                        style={styles.configInput}
                        value={item.targetSets.toString()}
                        onChangeText={text =>
                          updateExerciseConfig(index, 'targetSets', parseInt(text) || 0)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>REPS</Text>
                      <TextInput
                        style={styles.configInput}
                        value={item.targetRepRange}
                        onChangeText={text =>
                          updateExerciseConfig(index, 'targetRepRange', text)
                        }
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(index)}
                  style={styles.deleteButton}
                >
                  <Trash size={20} color="#71717a" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowExercisePicker(true)}
        >
          <Plus size={20} color="#06b6d4" />
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <Modal visible={showExercisePicker} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <X size={24} color="#71717a" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {availableExercises.map(ex => (
              <TouchableOpacity
                key={ex.id}
                style={styles.exerciseOption}
                onPress={() => addExercise(ex)}
              >
                <View>
                  <Text style={styles.exerciseOptionName}>{ex.name}</Text>
                  <Text style={styles.exerciseOptionInfo}>
                    {ex.muscleGroup} • {ex.type}
                  </Text>
                </View>
                <Plus size={20} color="#06b6d4" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Exercise Modal */}
      <Modal visible={isCustomModalOpen} transparent animationType="fade">
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalContent}>
            <View style={styles.customModalHeader}>
              <Text style={styles.customModalTitle}>Create Custom Exercise</Text>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.customInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Exercise Name"
              placeholderTextColor="#52525b"
            />
            <TouchableOpacity style={styles.createButton} onPress={handleCreateCustom}>
              <Text style={styles.createButtonText}>Create Exercise</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#06b6d4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveText: {
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
  nameInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
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
  emptyCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCardContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
    marginBottom: 8,
  },
  exerciseConfig: {
    flexDirection: 'row',
    gap: 16,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  configLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  configInput: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 6,
    padding: 6,
    width: 50,
    textAlign: 'center',
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    borderRadius: 12,
    padding: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    flex: 1,
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4d4d8',
    marginBottom: 4,
  },
  exerciseOptionInfo: {
    fontSize: 12,
    color: '#71717a',
    textTransform: 'uppercase',
  },
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  customModalContent: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  customModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  customInput: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoutineBuilder;
