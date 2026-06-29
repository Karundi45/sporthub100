import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Platform, ScrollView, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../../src/services/api';
import { LineChart } from 'react-native-chart-kit';
import { useMemo } from 'react';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function AnalyticsScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data;
    }
  });

  const chartData = useMemo(() => {
    if (!data?.weeklyTrends || data.weeklyTrends.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    const labels = data.weeklyTrends.map((t: any) => {
      const date = new Date(t._id);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const distances = data.weeklyTrends.map((t: any) => t.totalDistance / 1000);
    return {
      labels,
      datasets: [
        {
          data: distances
        }
      ]
    };
  }, [data]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading analytics.</Text></View>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.largeTitle, { color: theme.text }]}>Summary</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{(data?.overall?.totalDistance / 1000 || 0).toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total KM</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{data?.overall?.totalWorkouts || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Workouts</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{(data?.overall?.totalCalories || 0).toFixed(0)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Calories</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{Math.floor((data?.overall?.totalDuration || 0) / 60)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mins</Text>
            </View>
          </View>
        </View>

        {chartData.labels.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Distance (Last 7 Days)</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 80}
              height={220}
              yAxisSuffix="km"
              chartConfig={{
                backgroundColor: theme.surface,
                backgroundGradientFrom: theme.surface,
                backgroundGradientTo: theme.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => isDark ? `rgba(0, 255, 102, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: theme.primary
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        )}

        <Text style={[styles.listHeader, { color: theme.textSecondary }]}>ACTIVITY DISTRIBUTION</Text>
        <View style={[styles.listCard, { backgroundColor: theme.surface }]}>
          {data?.activityDistribution?.length > 0 ? (
            data.activityDistribution.map((activity: any, index: number) => (
              <View key={activity._id} style={[styles.row, { borderBottomColor: theme.border, backgroundColor: theme.surface }, index === data.activityDistribution.length - 1 && styles.lastRow]}>
                <Text style={[styles.activityName, { color: theme.text }]}>{activity._id}</Text>
                <Text style={[styles.activityValue, { color: theme.textSecondary }]}>{activity.count} sessions</Text>
              </View>
            ))
          ) : (
            <View style={[styles.row, { borderBottomColor: theme.border, backgroundColor: theme.surface }, styles.lastRow]}>
              <Text style={[styles.activityName, { color: theme.text }]}>No activities yet</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    paddingRight: 0,
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
