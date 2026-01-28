import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSession, MuscleGroup } from '../types';
import { calculateMuscleRecovery, calculateWeeklyVolume, calculate1RM } from '../constants';
import { Activity, TrendingUp, Flame } from './Icons';
import { useAsyncStorage } from '../hooks/useAsyncStorage';

interface ScienceTabProps {
  history: WorkoutSession[];
}

const ScienceTab: React.FC<ScienceTabProps> = ({ history }) => {
  const [activeTab, setActiveTab] = useState<'recovery' | 'progress' | 'nutrition'>('recovery');
  const [nutritionLogs] = useAsyncStorage<Record<string, any>>('hl-nutrition-logs', {});
  
  const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  const recoveryData = useMemo(() => {
    return muscleGroups.map(muscle => calculateMuscleRecovery(history, muscle));
  }, [history]);

  const volumeData = useMemo(() => {
    return muscleGroups.map(muscle => calculateWeeklyVolume(history, muscle));
  }, [history]);

  // Calculate progress data for key exercises
  const progressData = useMemo(() => {
    const keyExercises = [
      'squat',
      'bench-press',
      'barbell-row',
      'ohp',
      'rdl',
    ];

    return keyExercises.map(exerciseId => {
      const sessions = [...history]
        .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-8);

      if (sessions.length === 0) return null;

      const data = sessions.map(session => {
        const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
        if (!exercise) return null;

        const maxSet = exercise.sets
          .filter(s => s.completed && s.weight > 0 && s.reps > 0)
          .reduce((max, set) => {
            const e1rm = calculate1RM(set.weight, set.reps);
            return e1rm > max.e1rm ? { e1rm, weight: set.weight, reps: set.reps } : max;
          }, { e1rm: 0, weight: 0, reps: 0 });

        return {
          date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          e1rm: maxSet.e1rm,
          weight: maxSet.weight,
          reps: maxSet.reps,
        };
      }).filter(Boolean);

      const exerciseName = sessions[0].exercises.find(e => e.exerciseId === exerciseId)?.name || '';
      const trend = data.length >= 2 && data[data.length - 1]!.e1rm > data[0]!.e1rm ? 'increasing' : 'stable';
      const change = data.length >= 2 ? data[data.length - 1]!.e1rm - data[0]!.e1rm : 0;

      return {
        exerciseId,
        exerciseName,
        data,
        trend,
        change,
        current: data[data.length - 1],
      };
    }).filter(Boolean);
  }, [history]);

  // Calculate nutrition stats
  const nutritionStats = useMemo(() => {
    const logs = Object.values(nutritionLogs);
    const last7Days = logs.slice(-7);
    
    if (last7Days.length === 0) {
      return {
        avgProtein: 0,
        avgCalories: 0,
        proteinDays: 0,
        refeedDays: 0,
      };
    }

    const avgProtein = Math.round(
      last7Days.reduce((sum: number, log: any) => sum + (log.protein || 0), 0) / last7Days.length
    );
    const avgCalories = Math.round(
      last7Days.reduce((sum: number, log: any) => sum + (log.calories || 0), 0) / last7Days.length
    );
    const proteinDays = last7Days.filter((log: any) => log.protein >= 160).length;
    const refeedDays = last7Days.filter((log: any) => log.isRefeed).length;

    return { avgProtein, avgCalories, proteinDays, refeedDays };
  }, [nutritionLogs]);

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
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recovery' && styles.tabActive]}
          onPress={() => setActiveTab('recovery')}
        >
          <Text style={[styles.tabText, activeTab === 'recovery' && styles.tabTextActive]}>
            Recovery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
            Nutrition
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Training Science</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'recovery' && 'Fatigue Management & Recovery Intelligence'}
            {activeTab === 'progress' && 'Strength Progression & Performance Metrics'}
            {activeTab === 'nutrition' && 'Dietary Compliance & Macro Tracking'}
          </Text>
        </View>

        {/* Recovery Tab */}
        {activeTab === 'recovery' && (
          <>
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
          </>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Strength Progress</Text>
            </View>
            {progressData.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No progress data available yet</Text>
              </View>
            ) : (
              progressData.map((item: any) => (
                <View key={item.exerciseId} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressExercise}>{item.exerciseName}</Text>
                    <View
                      style={[
                        styles.trendBadge,
                        item.trend === 'increasing' && styles.trendBadgeUp,
                      ]}
                    >
                      <TrendingUp
                        size={12}
                        color={item.trend === 'increasing' ? '#22c55e' : '#71717a'}
                      />
                      <Text
                        style={[
                          styles.trendText,
                          { color: item.trend === 'increasing' ? '#22c55e' : '#71717a' },
                        ]}
                      >
                        {item.change > 0 ? '+' : ''}{item.change} lbs
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressStats}>
                    <View style={styles.progressStat}>
                      <Text style={styles.progressLabel}>CURRENT E1RM</Text>
                      <Text style={styles.progressValue}>{item.current?.e1rm || 0} lbs</Text>
                    </View>
                    <View style={styles.progressStat}>
                      <Text style={styles.progressLabel}>LAST SET</Text>
                      <Text style={styles.progressValue}>
                        {item.current?.weight || 0} x {item.current?.reps || 0}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.miniChart}>
                    {item.data.map((point: any, idx: number) => {
                      const maxE1RM = Math.max(...item.data.map((d: any) => d.e1rm));
                      const height = (point.e1rm / maxE1RM) * 60;
                      return (
                        <View key={idx} style={styles.chartBar}>
                          <View
                            style={[
                              styles.chartBarFill,
                              {
                                height: height,
                                backgroundColor:
                                  idx === item.data.length - 1 ? '#06b6d4' : '#3f3f46',
                              },
                            ]}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>7-Day Nutrition Summary</Text>
              </View>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>AVG PROTEIN</Text>
                  <Text style={styles.nutritionValue}>{nutritionStats.avgProtein}g</Text>
                  <Text style={styles.nutritionSubtext}>per day</Text>
                </View>
                <View style={styles.nutritionCard}>
                  <Text style={styles.nutritionLabel}>AVG CALORIES</Text>
                  <Text style={styles.nutritionValue}>{nutritionStats.avgCalories}</Text>
                  <Text style={styles.nutritionSubtext}>per day</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Compliance Metrics</Text>
              </View>
              <View style={styles.complianceCard}>
                <View style={styles.complianceRow}>
                  <View style={styles.complianceLabel}>
                    <View style={[styles.complianceDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.complianceText}>Protein Target Days</Text>
                  </View>
                  <Text style={styles.complianceValue}>
                    {nutritionStats.proteinDays}/7
                  </Text>
                </View>
                <View style={styles.complianceBar}>
                  <View
                    style={[
                      styles.complianceProgress,
                      { width: `${(nutritionStats.proteinDays / 7) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.complianceCard}>
                <View style={styles.complianceRow}>
                  <View style={styles.complianceLabel}>
                    <View style={[styles.complianceDot, { backgroundColor: '#f97316' }]} />
                    <Text style={styles.complianceText}>Refeed Days</Text>
                  </View>
                  <Text style={styles.complianceValue}>
                    {nutritionStats.refeedDays}/7
                  </Text>
                </View>
                <View style={styles.complianceBar}>
                  <View
                    style={[
                      styles.complianceProgress,
                      {
                        width: `${(nutritionStats.refeedDays / 7) * 100}%`,
                        backgroundColor: '#f97316',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Flame size={20} color="#f97316" />
              <Text style={styles.insightText}>
                Consistent protein intake is crucial for muscle protein synthesis. Aim for 160g+ daily.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#06b6d4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  tabTextActive: {
    color: '#06b6d4',
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
    fontSize: 13,
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
  progressCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#27272a',
    borderRadius: 6,
  },
  trendBadgeUp: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  trendText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  progressStat: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e4e4e7',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
    paddingTop: 8,
  },
  chartBar: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 2,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  nutritionSubtext: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 4,
  },
  complianceCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  complianceText: {
    fontSize: 13,
    color: '#d4d4d8',
  },
  complianceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  complianceBar: {
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  complianceProgress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  insightCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#e4e4e7',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
