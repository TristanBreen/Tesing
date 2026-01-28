import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSession, MuscleGroup } from '../types';
import { calculateMuscleRecovery, calculateWeeklyVolume } from '../constants';
import { Activity } from './Icons';

interface ScienceTabProps {
  history: WorkoutSession[];
}

const ScienceTab: React.FC<ScienceTabProps> = ({ history }) => {
  const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  const recoveryData = useMemo(() => {
    return muscleGroups.map(muscle => calculateMuscleRecovery(history, muscle));
  }, [history]);

  const volumeData = useMemo(() => {
    return muscleGroups.map(muscle => calculateWeeklyVolume(history, muscle));
  }, [history]);

  const getRecoveryColor = (status: string) => {
    switch (status) {
      case 'recovered':
        return '#22c55e';
      case 'recovering':
        return '#eab308';
      case 'fresh':
        return '#3b82f6';
      default:
        return '#71717a';
    }
  };

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Activity size={80} color="#27272a" />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete your first workout to unlock recovery intelligence and hypertrophy insights.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Training Science</Text>
          <Text style={styles.subtitle}>Fatigue Management & Recovery Intelligence</Text>
        </View>

        {/* Muscle Recovery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Muscle Recovery</Text>
          </View>
          <View style={styles.grid}>
            {recoveryData.map(r => (
              <View
                key={r.muscleGroup}
                style={[
                  styles.recoveryCard,
                  { borderColor: getRecoveryColor(r.fatigueStatus) },
                ]}
              >
                <View style={styles.recoveryHeader}>
                  <Text style={styles.recoveryMuscle}>{r.muscleGroup}</Text>
                  <View
                    style={[
                      styles.recoveryBadge,
                      { backgroundColor: getRecoveryColor(r.fatigueStatus) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recoveryStatus,
                        { color: getRecoveryColor(r.fatigueStatus) },
                      ]}
                    >
                      {r.fatigueStatus}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recoveryInfo}>
                  {r.hoursSinceTraining === Infinity ? 'Fresh' : `${r.hoursSinceTraining}h ago`} •{' '}
                  {r.setsLastSession} sets
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Volume */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Volume (Sets)</Text>
          </View>
          <View style={styles.volumeContainer}>
            {volumeData.map(v => {
              const maxRange = v.recommendedRange[1] * 1.5;
              const percent = Math.min(100, (v.setsThisWeek / maxRange) * 100);
              const isOptimal = v.status === 'optimal';
              const isOver = v.status === 'overtrained';

              return (
                <View key={v.muscleGroup} style={styles.volumeItem}>
                  <View style={styles.volumeHeader}>
                    <Text style={styles.volumeMuscle}>{v.muscleGroup}</Text>
                    <Text
                      style={[
                        styles.volumeValue,
                        {
                          color: isOptimal
                            ? '#22c55e'
                            : isOver
                            ? '#ef4444'
                            : '#3b82f6',
                        },
                      ]}
                    >
                      {v.setsThisWeek} / {v.recommendedRange[0]}-{v.recommendedRange[1]}
                    </Text>
                  </View>
                  <View style={styles.volumeBar}>
                    <View
                      style={[
                        styles.volumeProgress,
                        {
                          width: `${percent}%`,
                          backgroundColor: isOptimal
                            ? '#22c55e'
                            : isOver
                            ? '#ef4444'
                            : '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recoveryCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    width: '48%',
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recoveryMuscle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  recoveryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recoveryStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  recoveryInfo: {
    fontSize: 10,
    color: '#71717a',
  },
  volumeContainer: {
    gap: 16,
  },
  volumeItem: {
    gap: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeMuscle: {
    fontSize: 12,
    color: '#d4d4d8',
    fontWeight: '500',
  },
  volumeValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  volumeBar: {
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeProgress: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    maxWidth: 320,
  },
});

export default ScienceTab;
