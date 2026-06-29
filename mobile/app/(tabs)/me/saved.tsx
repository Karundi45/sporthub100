import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Map from '../../../components/Map';
import api from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function SavedScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['my-workouts', user?._id],
    queryFn: async () => {
      const res = await api.get('/workouts/user/' + user?._id);
      return res.data;
    },
    enabled: !!user?._id,
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Aggregate all routes to form a heatmap
  const allShapes = (workouts || []).filter((w: any) => w.route && w.route.length > 1).map((workout: any, index: number) => ({
    shapeType: 'Polyline',
    positions: workout.route.map((point: any) => ({ lat: point.lat, lng: point.lng })),
    color: `hsla(${Math.random() * 360}, 100%, 50%, 0.6)`, // Random color for each route to distinguish them
    weight: 4,
  }));

  // Find the center based on the last workout's first point
  const lastWorkoutWithRoute = workouts?.find((w: any) => w.route && w.route.length > 0);
  const mapCenterPosition = lastWorkoutWithRoute 
    ? { lat: lastWorkoutWithRoute.route[0].lat, lng: lastWorkoutWithRoute.route[0].lng } 
    : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Heatmap</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.mapContainer}>
        <Map
          mapLayers={[
            {
              layerType: 'TileLayer' as any,
              url: isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              baseLayer: true,
            }
          ]}
          mapShapes={allShapes}
          mapCenterPosition={mapCenterPosition}
          zoom={12}
        />
      </View>

      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: theme.text }]}>All Saved Routes</Text>
        <FlatList
          data={workouts || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.workoutCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.workoutTitle, { color: theme.text }]}>{item.title}</Text>
              <View style={styles.workoutStats}>
                <Text style={styles.statText}>{(item.distance / 1000).toFixed(2)} km</Text>
                <Text style={styles.statText}>•</Text>
                <Text style={styles.statText}>{Math.round(item.duration / 60)} min</Text>
              </View>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No saved routes yet. Start tracking to build your heatmap!</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  backBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    height: 350,
    width: '100%',
    backgroundColor: '#1C1C1E',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statText: {
    color: '#E5A00D',
    fontWeight: '600',
  },
  dateText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  emptyText: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
});
