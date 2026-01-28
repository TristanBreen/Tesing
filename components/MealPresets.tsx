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
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { MealPreset } from '../types';
import { generateId } from '../constants';
import { Flame, Plus, Trash, X, Check } from './Icons';

interface MealPresetsProps {
  onLogMeal: (meal: MealPreset) => void;
}

const MealPresets: React.FC<MealPresetsProps> = ({ onLogMeal }) => {
  const [meals, setMeals] = useAsyncStorage<MealPreset[]>('hl-meal-presets', []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMeal = () => {
    if (!newMeal.name) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    const meal: MealPreset = {
      id: generateId(),
      name: newMeal.name,
      calories: Number(newMeal.calories) || 0,
      protein: Number(newMeal.protein) || 0,
      carbs: Number(newMeal.carbs) || 0,
      fats: Number(newMeal.fats) || 0,
    };

    setMeals([...meals, meal]);
    setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    setIsCreateModalOpen(false);
    Alert.alert('Success', 'Meal preset saved');
  };

  const handleDeleteMeal = (id: string, name: string) => {
    Alert.alert(
      'Delete Meal',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setMeals(meals.filter(m => m.id !== id)),
        },
      ]
    );
  };

  const handleLogMeal = (meal: MealPreset) => {
    onLogMeal(meal);
    Alert.alert('Success', `${meal.name} logged to today's nutrition`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Presets</Text>
        <Text style={styles.subtitle}>Quick log your favorite meals</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search meals..."
          placeholderTextColor="#52525b"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredMeals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Flame size={48} color="#27272a" />
            <Text style={styles.emptyTitle}>No Meal Presets</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No meals match your search' : 'Create your first meal preset for quick logging'}
            </Text>
          </View>
        ) : (
          filteredMeals.map(meal => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealMain}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.mealMacros}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.calories}</Text>
                    <Text style={styles.macroLabel}>cal</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: '#3b82f6' }]}>
                      {meal.protein}g
                    </Text>
                    <Text style={styles.macroLabel}>protein</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: '#eab308' }]}>
                      {meal.carbs}g
                    </Text>
                    <Text style={styles.macroLabel}>carbs</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: '#ef4444' }]}>
                      {meal.fats}g
                    </Text>
                    <Text style={styles.macroLabel}>fats</Text>
                  </View>
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => handleLogMeal(meal)}
                >
                  <Check size={16} color="#000" />
                  <Text style={styles.logButtonText}>Log</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMeal(meal.id, meal.name)}
                >
                  <Trash size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsCreateModalOpen(true)}
      >
        <Plus size={24} color="#000" />
      </TouchableOpacity>

      {/* Create Meal Modal */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Meal Preset</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={24} color="#71717a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MEAL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={newMeal.name}
                  onChangeText={text => setNewMeal({ ...newMeal, name: text })}
                  placeholder="e.g. Chicken & Rice"
                  placeholderTextColor="#52525b"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CALORIES</Text>
                <TextInput
                  style={styles.input}
                  value={newMeal.calories}
                  onChangeText={text => setNewMeal({ ...newMeal, calories: text })}
                  placeholder="0"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>PROTEIN (G)</Text>
                  <TextInput
                    style={styles.input}
                    value={newMeal.protein}
                    onChangeText={text => setNewMeal({ ...newMeal, protein: text })}
                    placeholder="0"
                    placeholderTextColor="#52525b"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CARBS (G)</Text>
                  <TextInput
                    style={styles.input}
                    value={newMeal.carbs}
                    onChangeText={text => setNewMeal({ ...newMeal, carbs: text })}
                    placeholder="0"
                    placeholderTextColor="#52525b"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FATS (G)</Text>
                <TextInput
                  style={styles.input}
                  value={newMeal.fats}
                  onChangeText={text => setNewMeal({ ...newMeal, fats: text })}
                  placeholder="0"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreateModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateMeal}
              >
                <Text style={styles.createButtonText}>Save Preset</Text>
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
  mealCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealMain: {
    padding: 16,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  mealMacros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
  },
  macroLabel: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272a',
  },
  mealActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    padding: 12,
    gap: 8,
  },
  logButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  deleteButton: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#71717a',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MealPresets;
