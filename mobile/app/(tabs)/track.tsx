import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, Platform, Switch } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Map from '../../components/Map';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../src/store/useAuthStore';
import ActivitySelector from '../../components/ActivitySelector';
import api, { API_URL } from '../../src/services/api';
import { locationStore } from '../../src/services/locationTask';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAppTheme } from '../../src/theme/colors';

export default function TrackingScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<{latitude: number, longitude: number, timestamp: Date}[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState('Running');
  const [isLive, setIsLive] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{lat: number, lng: number}[]>([]);
  
  // Metrics
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [calories, setCalories] = useState(0);
  
  // Real-time
  const [friendsLocations, setFriendsLocations] = useState<Record<string, { lat: number, lon: number, username: string }>>({});
  
  const { user } = useAuthStore();
  const timerRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location in foreground was denied');
        return;
      }
      
      let bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        Alert.alert('Background location permission denied', 'App may not track when minimized.');
      }
    })();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (isLive) {
      const baseUrl = API_URL.replace('/api', '');
      const newSocket = io(baseUrl);
      setSocket(newSocket);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isLive]);

  // Timer for duration
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused]);

  // Handle Location Tracking lifecycle
  useEffect(() => {
    if (isTracking && !isPaused) {
      (async () => {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setLocation(location);
            setRouteCoordinates((prev) => [...prev, { lat: location.coords.latitude, lng: location.coords.longitude }]);
            
            if (isLive && socket) {
              socket.emit('update_location', {
                userId: user?._id,
                username: user?.username,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
            }
          }
        );
        subscriptionRef.current = sub;
      })();
    } else {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [isTracking, isPaused, isLive, socket]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculatePace = () => {
    if (distance === 0 || duration === 0) return '0:00';
    const distanceKm = distance / 1000;
    const minutesPerKm = (duration / 60) / distanceKm;
    const mins = Math.floor(minutesPerKm);
    const secs = Math.floor((minutesPerKm - mins) * 60);
    if (mins > 60) return '--:--';
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTracking = () => {
    if (isTracking) handleStop();
    else handleStart();
  };

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);
    setDuration(0);
    setRouteCoordinates([]);
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleStop = async () => {
    setIsTracking(false);
    setIsPaused(false);

    try {
      await api.post('/workouts', {
        title: `${activityType} Session`,
        activityType,
        route: routeCoordinates.map(coord => ({
          latitude: coord.lat,
          longitude: coord.lng,
          timestamp: new Date(),
        })),
        distance: distance,
        duration,
        movingTime: duration,
        calories: Math.round(distance * 0.06),
        startTime: new Date(),
        endTime: new Date(),
      });
      Alert.alert('Success', 'Workout saved successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save workout.');
    }
  };

  const mapShapes = routeCoordinates.length > 1 ? [
    {
      shapeType: 'Polyline' as any,
      positions: routeCoordinates,
      color: '#007AFF',
      weight: 6,
    }
  ] : [];

  const mapMarkers = location ? [{
    id: 'current_user',
    position: { lat: location.coords.latitude, lng: location.coords.longitude },
    icon: '🔵',
    title: 'You',
  }] : [];

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          mapLayers={[{
            layerType: 'TileLayer' as any,
            url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            baseLayer: true,
          }]}
          mapShapes={mapShapes}
          mapMarkers={mapMarkers}
          mapCenterPosition={location ? { lat: location.coords.latitude, lng: location.coords.longitude } : undefined}
          zoom={15}
        />
      </View>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topStats}>
          <Text style={[styles.title, { color: theme.text, textShadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>GPS Tracker</Text>
          {!isTracking && (
            <ActivitySelector selectedActivity={activityType} onSelectActivity={setActivityType} disabled={isTracking} />
          )}
        </View>

        <View style={styles.bottomControls}>
          <View style={[styles.statsPanel, { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{(distance / 1000).toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>KM</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{calculatePace()}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>PACE</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatTime(duration)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TIME</Text>
            </View>
          </View>

          <View style={[styles.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>Go Live (Broadcast Location)</Text>
            <Switch value={isLive} onValueChange={setIsLive} trackColor={{ false: '#3A3A3C', true: theme.primary }} />
          </View>

          <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.success }, isTracking && { backgroundColor: theme.error }]} onPress={toggleTracking}>
            <Text style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>{isTracking ? 'STOP' : 'START'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  topStats: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    width: '100%',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  mainButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
