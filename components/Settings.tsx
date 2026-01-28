import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { UserGoals, UserPreferences } from '../types';
import { DEFAULT_GOALS } from '../constants';
import { Save, Trash, Timer } from './Icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsProps {
  onBack: () => void;
  onReset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultRestTimer: 90,
  weightUnit: 'lbs',
  autoStartTimer: true,
  enablePRNotifications: true,
  minRecoveryHours: 48,
  deloadFrequency: 5,
};

const Settings: React.FC<SettingsProps> = ({ onBack, onReset }) => {
  const [goals, setGoals] = useAsyncStorage<UserGoals>(
    'hl-user-goals',
    DEFAULT_GOALS
  );
  const [prefs, setPrefs] = useAsyncStorage<UserPreferences>(
    'hl-user-preferences',
    DEFAULT_PREFERENCES
  );

  const [localGoals, setLocalGoals] = useState(goals);
  const [localPrefs, setLocalPrefs] = useState(prefs);

  const handleSave = () => {
    setGoals(localGoals);
    setPrefs(localPrefs);
    Alert.alert('Success', 'Settings saved successfully');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to wipe all data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'All data has been reset');
            onReset();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* User Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USER PROFILE</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CALORIES</Text>
                <TextInput
                  style={styles.input}
                  value={localGoals.dailyCalories.toString()}
                  onChangeText={text =>
                    setLocalGoals({
                      ...localGoals,
                      dailyCalories: Number(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PROTEIN (G)</Text>
                <TextInput
                  style={styles.input}
                  value={localGoals.dailyProtein.toString()}
                  onChangeText={text =>
                    setLocalGoals({
                      ...localGoals,
                      dailyProtein: Number(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Training Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAINING PREFERENCES</Text>
          <View style={styles.card}>
            <View style={styles.preference}>
              <View style={styles.preferenceHeader}>
                <Timer size={20} color="#06b6d4" />
                <Text style={styles.preferenceLabel}>Default Rest Timer</Text>
              </View>
              <View style={styles.timerOptions}>
                {[60, 90, 120, 180].map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.timerOption,
                      localPrefs.defaultRestTimer === seconds &&
                        styles.timerOptionActive,
                    ]}
                    onPress={() =>
                      setLocalPrefs({ ...localPrefs, defaultRestTimer: seconds })
                    }
                  >
                    <Text
                      style={[
                        styles.timerOptionText,
                        localPrefs.defaultRestTimer === seconds &&
                          styles.timerOptionTextActive,
                      ]}
                    >
                      {seconds}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.preference}>
              <Text style={styles.preferenceLabel}>Weight Unit</Text>
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    localPrefs.weightUnit === 'lbs' && styles.unitButtonActive,
                  ]}
                  onPress={() => setLocalPrefs({ ...localPrefs, weightUnit: 'lbs' })}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      localPrefs.weightUnit === 'lbs' && styles.unitButtonTextActive,
                    ]}
                  >
                    LBS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    localPrefs.weightUnit === 'kg' && styles.unitButtonActive,
                  ]}
                  onPress={() => setLocalPrefs({ ...localPrefs, weightUnit: 'kg' })}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      localPrefs.weightUnit === 'kg' && styles.unitButtonTextActive,
                    ]}
                  >
                    KG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#000" />
          <Text style={styles.saveButtonText}>Save All Settings</Text>
        </TouchableOpacity>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
            <Trash size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hypertrophy Lab v1.2.0</Text>
          <Text style={styles.footerText}>Made with Science 💪</Text>
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
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
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
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
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
    fontFamily: 'monospace',
  },
  preference: {
    gap: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#d4d4d8',
  },
  timerOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerOption: {
    flex: 1,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timerOptionActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  timerOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  timerOptionTextActive: {
    color: '#000',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  unitButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#06b6d4',
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  unitButtonTextActive: {
    color: '#000',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e4e4e7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#52525b',
  },
});

export default Settings;
