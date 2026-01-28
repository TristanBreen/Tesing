import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { UserGoals, UserPreferences, UserProfile, BodyMetrics } from '../types';
import { DEFAULT_GOALS, DEFAULT_PROFILE, calculateBodyMetrics, calculateProteinTarget } from '../constants';
import { Save, Trash, Timer, Download, Upload, Activity, User } from './Icons';
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
  const [profile, setProfile] = useAsyncStorage<UserProfile>(
    'hl-user-profile',
    DEFAULT_PROFILE
  );

  const [localGoals, setLocalGoals] = useState(goals);
  const [localPrefs, setLocalPrefs] = useState(prefs);
  const [localProfile, setLocalProfile] = useState(profile);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const metrics = calculateBodyMetrics(localProfile);
    setBodyMetrics(metrics);
    
    // Auto-update protein target based on lean body mass
    const recommendedProtein = calculateProteinTarget(localProfile, metrics);
    setLocalGoals(prev => ({ ...prev, dailyProtein: recommendedProtein }));
  }, [localProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setGoals(localGoals),
        setPrefs(localPrefs),
        setProfile(localProfile),
      ]);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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
      
      await Share.share({
        message: jsonString,
        title: 'Hypertrophy Lab Backup',
      });

      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
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

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'underweight': return '#3b82f6';
      case 'normal': return '#22c55e';
      case 'overweight': return '#eab308';
      case 'obese': return '#ef4444';
      default: return '#71717a';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Personalize your hypertrophy journey</Text>
        </View>

        {/* User Profile */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <User size={18} color="#06b6d4" />
            <Text style={styles.sectionTitle}>USER PROFILE</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AGE</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.age.toString()}
                  onChangeText={text =>
                    setLocalProfile({
                      ...localProfile,
                      age: Number(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor="#52525b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GENDER</Text>
                <View style={styles.genderToggle}>
                  {(['male', 'female', 'other'] as const).map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderButton,
                        localProfile.gender === g && styles.genderButtonActive,
                      ]}
                      onPress={() => setLocalProfile({ ...localProfile, gender: g })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          localProfile.gender === g && styles.genderButtonTextActive,
                        ]}
                      >
                        {g[0].toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HEIGHT (FT)</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.heightFeet.toString()}
                  onChangeText={text =>
                    setLocalProfile({
                      ...localProfile,
                      heightFeet: Number(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#52525b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HEIGHT (IN)</Text>
                <TextInput
                  style={styles.input}
                  value={localProfile.heightInches.toString()}
                  onChangeText={text =>
                    setLocalProfile({
                      ...localProfile,
                      heightInches: Number(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#52525b"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WEIGHT (LBS)</Text>
              <TextInput
                style={styles.input}
                value={localProfile.weightLbs.toString()}
                onChangeText={text =>
                  setLocalProfile({
                    ...localProfile,
                    weightLbs: Number(text) || 0,
                  })
                }
                keyboardType="numeric"
                placeholder="170"
                placeholderTextColor="#52525b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ACTIVITY LEVEL</Text>
              <View style={styles.activityGrid}>
                {[
                  { key: 'sedentary', label: 'Sedentary' },
                  { key: 'light', label: 'Light' },
                  { key: 'moderate', label: 'Moderate' },
                  { key: 'active', label: 'Active' },
                  { key: 'very_active', label: 'Very Active' },
                ].map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.activityButton,
                      localProfile.activityLevel === key && styles.activityButtonActive,
                    ]}
                    onPress={() =>
                      setLocalProfile({ ...localProfile, activityLevel: key as any })
                    }
                  >
                    <Text
                      style={[
                        styles.activityButtonText,
                        localProfile.activityLevel === key && styles.activityButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Body Metrics Card */}
          {bodyMetrics && (
            <View style={styles.metricsCard}>
              <View style={styles.metricsHeader}>
                <Activity size={16} color="#06b6d4" />
                <Text style={styles.metricsTitle}>Body Metrics</Text>
              </View>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>BMI</Text>
                  <Text style={[styles.metricValue, { color: getBMICategoryColor(bodyMetrics.bmiCategory) }]}>
                    {bodyMetrics.bmi}
                  </Text>
                  <Text style={styles.metricSubtext}>{bodyMetrics.bmiCategory}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>BMR</Text>
                  <Text style={styles.metricValue}>{bodyMetrics.bmr}</Text>
                  <Text style={styles.metricSubtext}>cal/day</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TDEE</Text>
                  <Text style={styles.metricValue}>{bodyMetrics.tdee}</Text>
                  <Text style={styles.metricSubtext}>cal/day</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Lean Mass</Text>
                  <Text style={styles.metricValue}>{bodyMetrics.leanBodyMass}</Text>
                  <Text style={styles.metricSubtext}>lbs</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Nutrition Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NUTRITION GOALS</Text>
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
                  placeholder={bodyMetrics?.tdee.toString()}
                  placeholderTextColor="#52525b"
                />
                {bodyMetrics && (
                  <Text style={styles.inputHint}>Recommended: {bodyMetrics.tdee}</Text>
                )}
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
                  placeholderTextColor="#52525b"
                />
                {bodyMetrics && (
                  <Text style={styles.inputHint}>
                    Based on {bodyMetrics.leanBodyMass}lb lean mass
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Training Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Timer size={18} color="#06b6d4" />
            <Text style={styles.sectionTitle}>TRAINING PREFERENCES</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.preference}>
              <Text style={styles.preferenceLabel}>Default Rest Timer</Text>
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
                  ios_backgroundColor="#27272a"
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
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Save size={20} color="#000" />
              <Text style={styles.saveButtonText}>Save All Settings</Text>
            </>
          )}
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
          <Text style={styles.footerText}>Hypertrophy Lab v1.3.1</Text>
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
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
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
    padding: 14,
    color: '#fff',
    fontSize: 16,
    minHeight: 48,
  },
  inputHint: {
    fontSize: 11,
    color: '#52525b',
    marginTop: -4,
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#06b6d4',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#71717a',
  },
  genderButtonTextActive: {
    color: '#000',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  activityButtonActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  activityButtonTextActive: {
    color: '#000',
  },
  metricsCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#06b6d4',
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricSubtext: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  preference: {
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#d4d4d8',
    fontWeight: '600',
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
    minHeight: 44,
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
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  timerOptionActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  timerOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#71717a',
  },
  timerOptionTextActive: {
    color: '#000',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  unitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#06b6d4',
  },
  unitButtonText: {
    fontSize: 14,
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
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  sliderButtonActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  sliderButtonText: {
    fontSize: 12,
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
    backgroundColor: '#06b6d4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    minHeight: 56,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
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
    minHeight: 80,
    justifyContent: 'center',
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
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  dangerButtonText: {
    fontSize: 15,
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
