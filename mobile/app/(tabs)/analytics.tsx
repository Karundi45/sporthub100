import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/services/api';

export default function AnalyticsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data;
    }
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading analytics.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.largeTitle}>Summary</Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(data?.overall?.totalDistance / 1000 || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total KM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data?.overall?.totalWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(data?.overall?.totalCalories || 0).toFixed(0)}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.floor((data?.overall?.totalDuration || 0) / 60)}</Text>
              <Text style={styles.statLabel}>Mins</Text>
            </View>
          </View>
        </View>

        <Text style={styles.listHeader}>ACTIVITY DISTRIBUTION</Text>
        <View style={styles.listCard}>
          {data?.activityDistribution?.length > 0 ? (
            data.activityDistribution.map((activity: any, index: number) => (
              <View key={activity._id} style={[styles.row, index === data.activityDistribution.length - 1 && styles.lastRow]}>
                <Text style={styles.activityName}>{activity._id}</Text>
                <Text style={styles.activityValue}>{activity.count} sessions</Text>
              </View>
            ))
          ) : (
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.activityName}>No activities yet</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Apple System Gray 6
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 15,
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    backgroundColor: '#fff',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  activityName: {
    fontSize: 17,
    color: '#000',
  },
  activityValue: {
    fontSize: 17,
    color: '#8E8E93',
  },
});
