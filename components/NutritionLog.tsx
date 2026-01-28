import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { MacroDay, UserGoals, MealPreset } from '../types';
import { DEFAULT_GOALS, formatDate } from '../constants';
import { Plus, Flame, ChevronLeft, ChevronRight, Calendar, BookOpen } from './Icons';
import MealPresets from './MealPresets';

const NutritionLog = () => {
  const [goals] = useAsyncStorage<UserGoals>('hl-user-goals', DEFAULT_GOALS);
  const [logs, setLogs] = useAsyncStorage<Record<string, MacroDay>>(
    'hl-nutrition-logs',
    {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMealPresets, setShowMealPresets] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];
  const currentKey = getDateKey(viewDate);
  const isToday = currentKey === getDateKey(new Date());

  const changeDate = (days: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + days);
    setViewDate(newDate);
  };

  const currentLog = logs[currentKey] || {
    date: new Date(viewDate).toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    isRefeed: false,
  };

  const updateLog = (updates: Partial<MacroDay>) => {
    const newLog = { ...currentLog, ...updates };
    setLogs({ ...logs, [currentKey]: newLog });
  };

  const proteinPercent = Math.min(
    100,
    Math.round((currentLog.protein / goals.dailyProtein) * 100)
  );

  const [tempProtein, setTempProtein] = useState('');
  const [tempCalories, setTempCalories] = useState('');
  const [tempCarbs, setTempCarbs] = useState('');
  const [tempFats, setTempFats] = useState('');

  const handleAddMeal = () => {
    const p = Number(tempProtein) || 0;
    const c = Number(tempCalories) || 0;
    const carb = Number(tempCarbs) || 0;
    const f = Number(tempFats) || 0;

    updateLog({
      protein: currentLog.protein + p,
      calories: currentLog.calories + c,
      carbs: currentLog.carbs + carb,
      fats: currentLog.fats + f,
    });

    setTempProtein('');
    setTempCalories('');
    setTempCarbs('');
    setTempFats('');
    setIsModalOpen(false);
  };

  const handleLogPresetMeal = (meal: MealPreset) => {
    updateLog({
      protein: currentLog.protein + meal.protein,
      calories: currentLog.calories + meal.calories,
      carbs: currentLog.carbs + meal.carbs,
      fats: currentLog.fats + meal.fats,
    });
    setShowMealPresets(false);
  };

  if (showMealPresets) {
    return <MealPresets onLogMeal={handleLogPresetMeal} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Date Navigation */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Fuel</Text>
          <TouchableOpacity
            style={styles.presetsButton}
            onPress={() => setShowMealPresets(true)}
          >
            <BookOpen size={20} color="#06b6d4" />
            <Text style={styles.presetsButtonText}>Presets</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
            <ChevronLeft size={20} color="#a1a1aa" />
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Calendar size={14} color="#06b6d4" />
            <Text style={styles.dateText}>
              {isToday ? 'Today' : formatDate(viewDate.toISOString())}
            </Text>
          </View>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
            <ChevronRight size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Protein Pacer */}
        <View style={styles.proteinCard}>
          <View style={styles.proteinHeader}>
            <View>
              <Text style={styles.proteinLabel}>PROTEIN PACER</Text>
              <View style={styles.proteinValues}>
                <Text style={styles.proteinCurrent}>{currentLog.protein}</Text>
                <Text style={styles.proteinGoal}> / {goals.dailyProtein}g</Text>
              </View>
            </View>
            <Text style={styles.proteinPercent}>{proteinPercent}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${proteinPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* Calorie & Refeed */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Flame size={20} color={currentLog.isRefeed ? '#f97316' : '#52525b'} />
              <Text style={styles.statLabel}>Refeed Day</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentLog.isRefeed && styles.toggleButtonActive,
              ]}
              onPress={() => updateLog({ isRefeed: !currentLog.isRefeed })}
            >
              <Text
                style={[
                  styles.toggleText,
                  currentLog.isRefeed && styles.toggleTextActive,
                ]}
              >
                {currentLog.isRefeed ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Macro Split */}
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>Macro Split</Text>
          <View style={styles.macroList}>
            <View style={styles.macroItem}>
              <View style={styles.macroLabel}>
                <View style={[styles.macroDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.macroName}>Protein</Text>
              </View>
              <Text style={styles.macroValue}>{currentLog.protein}g</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroLabel}>
                <View style={[styles.macroDot, { backgroundColor: '#eab308' }]} />
                <Text style={styles.macroName}>Carbs</Text>
              </View>
              <Text style={styles.macroValue}>{currentLog.carbs}g</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroLabel}>
                <View style={[styles.macroDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.macroName}>Fats</Text>
              </View>
              <Text style={styles.macroValue}>{currentLog.fats}g</Text>
            </View>
            <View style={[styles.macroItem, styles.macroItemTotal]}>
              <Text style={styles.macroNameBold}>Calories</Text>
              <Text style={styles.macroValueBold}>
                {currentLog.calories} / {goals.dailyCalories}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Meal Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={20} color="#a1a1aa" />
          <Text style={styles.addButtonText}>Log Custom Meal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Meal Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Meal</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputs}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PROTEIN (G)</Text>
                <TextInput
                  style={styles.input}
                  value={tempProtein}
                  onChangeText={setTempProtein}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#52525b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CALORIES</Text>
                <TextInput
                  style={styles.input}
                  value={tempCalories}
                  onChangeText={setTempCalories}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#52525b"
                />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CARBS (G)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempCarbs}
                    onChangeText={setTempCarbs}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#52525b"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>FATS (G)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempFats}
                    onChangeText={setTempFats}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#52525b"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddMeal}>
                <Text style={styles.submitButtonText}>Add Log</Text>
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
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  presetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  presetsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e4e4e7',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  proteinCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  proteinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  proteinLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a1a1aa',
    marginBottom: 8,
    letterSpacing: 1,
  },
  proteinValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  proteinCurrent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  proteinGoal: {
    fontSize: 18,
    color: '#71717a',
  },
  proteinPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#27272a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  statsGrid: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  toggleButton: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  toggleTextActive: {
    color: '#f97316',
  },
  macroCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
    marginBottom: 12,
  },
  macroList: {
    gap: 12,
  },
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroItemTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.5)',
  },
  macroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 14,
    color: '#d4d4d8',
  },
  macroNameBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d4d4d8',
  },
  macroValue: {
    fontSize: 14,
    color: '#71717a',
    fontFamily: 'monospace',
  },
  macroValueBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    padding: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
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
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: '#71717a',
  },
  modalInputs: {
    gap: 12,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  submitButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default NutritionLog;
