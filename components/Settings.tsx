import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { UserGoals, UserPreferences } from '../types';
import { DEFAULT_GOALS } from '../constants';
import { Save, Trash, Timer, Download, Upload } from './Icons';
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

  const handleExportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      const exportData: Record<string, any> = {};
      stores.forEach(([key, value]) => {
        if (key.startsWith('hl-')) {
          try {
            exportData[key] = JSON.parse(value || '');
          } catch {
            exportData[key] = value;
          }
        }
      });

      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Use Share API (works on both iOS and Android)
      await Share.share({
        message: jsonString,
        title: 'Hypertrophy Lab Backup',
      });

      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Import functionality requires file picker. For now, you can manually restore from exported JSON by resetting and re-entering data.',
      [{ text: 'OK' }]
    );
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

            <View style={styles.preference}>
              <View style={styles.switchRow}>
                <Text style={styles.preferenceLabel}>Auto-Start Timer</Text>
                <Switch
                  value={localPrefs.autoStartTimer}
                  onValueChange={(value) =>
                    setLocalPrefs({ ...localPrefs, autoStartTimer: value })
                  }
                  trackColor={{ false: '#27272a', true: '#06b6d4' }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={styles.preferenceDescription}>
                Automatically start rest timer after completing a set
              </Text>
            </View>
          </View>
        </View>

        {/* Recovery Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECOVERY PARAMETERS</Text>
          <View style={styles.card}>
            <View style={styles.preference}>
              <View style={styles.sliderHeader}>
                <Text style={styles.preferenceLabel}>Min Recovery Hours</Text>
                <Text style={styles.sliderValue}>{localPrefs.minRecoveryHours}H</Text>
              </View>
              <View style={styles.sliderButtons}>
                {[24, 36, 48, 60, 72, 84, 96].map(hours => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.sliderButton,
                      localPrefs.minRecoveryHours === hours && styles.sliderButtonActive,
                    ]}
                    onPress={() =>
                      setLocalPrefs({ ...localPrefs, minRecoveryHours: hours })
                    }
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        localPrefs.minRecoveryHours === hours && styles.sliderButtonTextActive,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.preferenceDescription}>
                Minimum hours before a muscle group is considered recovered
              </Text>
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
          <View style={styles.dataManagementGrid}>
            <TouchableOpacity 
              style={styles.dataButton} 
              onPress={handleExportData}
            >
              <Download size={24} color="#e4e4e7" />
              <Text style={styles.dataButtonText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dataButton} 
              onPress={handleImportData}
            >
              <Upload size={24} color="#71717a" />
              <Text style={[styles.dataButtonText, { color: '#71717a' }]}>Import Data</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
            <Trash size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hypertrophy Lab v1.3.0</Text>
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
    fontWeight: '500',
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#71717a',
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  sliderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sliderButton: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sliderButtonActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  sliderButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#71717a',
  },
  sliderButtonTextActive: {
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
  dataManagementGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dataButton: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  dataButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e4e4e7',
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
