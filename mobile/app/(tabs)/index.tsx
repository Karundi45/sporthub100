import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import * as Location from 'expo-location';
import { socketService } from '../../src/services/socket';
import { useAuthStore } from '../../src/store/useAuthStore';
import ActivitySelector from '../../components/ActivitySelector';
import api from '../../src/services/api';

let MapView: any = View;
let Polyline: any = View;
let UrlTile: any = View;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Polyline = Maps.Polyline;
  UrlTile = Maps.UrlTile;
}

export default function TrackingScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<{latitude: number, longitude: number, timestamp: Date}[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState('Running');
  
  // Metrics
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [calories, setCalories] = useState(0);
  
  const { user } = useAuthStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      socketService.connect();
    })();

    return () => {
      socketService.disconnect();
    };
  }, []);

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

  // Location Tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (isTracking && !isPaused) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (newLocation) => {
            setLocation(newLocation);
            const newPoint = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              timestamp: new Date(),
            };
            
            setRoute((prev) => {
              if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];
                const d = getDistanceFromLatLonInM(
                  lastPoint.latitude, lastPoint.longitude,
                  newPoint.latitude, newPoint.longitude
                );
                setDistance((prevDist) => prevDist + d);
                // Simple calorie estimation: roughly 0.06 calories per meter
                setCalories((prevCal) => prevCal + (d * 0.06));
              }
              return [...prev, newPoint];
            });

            if (socketService.socket) {
              socketService.socket.emit('update_location', {
                userId: user?._id,
                location: newPoint,
              });
            }
          }
        );
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking, isPaused]);

  // Haversine formula for distance
  function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in m
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }

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

  const handleStart = () => {
    setIsTracking(true);
    setIsPaused(false);
    setRoute([]);
    setDistance(0);
    setDuration(0);
    setCalories(0);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    setIsTracking(false);
    setIsPaused(false);

    if (route.length < 2) {
      Alert.alert('Workout too short', 'This workout was too short to save.');
      return;
    }

    try {
      await api.post('/workouts', {
        title: `${activityType} Session`,
        activityType,
        route,
        distance,
        duration,
        movingTime: duration,
        calories: Math.round(calories),
        startTime: route[0].timestamp,
        endTime: new Date(),
      });
      Alert.alert('Success', 'Workout saved successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save workout to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map} 
        provider={null} // Null provider allows standard map tiles on both iOS and Android
        showsUserLocation={true}
        followsUserLocation={isTracking && !isPaused}
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        } : undefined}
      >
        {Platform.OS !== 'web' && (
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
        )}
        <Polyline coordinates={route} strokeColor="#007AFF" strokeWidth={6} lineCap="round" lineJoin="round" />
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topStats}>
          <Text style={styles.title}>GPS Tracker</Text>
          {!isTracking && (
            <ActivitySelector 
              selectedActivity={activityType} 
              onSelectActivity={setActivityType} 
              disabled={isTracking}
            />
          )}
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
              <Text style={styles.statLabel}>KM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculatePace()}</Text>
              <Text style={styles.statLabel}>PACE (/KM)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(duration)}</Text>
              <Text style={styles.statLabel}>TIME</Text>
            </View>
          </View>

          {!isTracking ? (
            <TouchableOpacity style={styles.mainButton} onPress={handleStart} activeOpacity={0.8}>
              <Text style={styles.buttonText}>START</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.trackingControls}>
              {isPaused ? (
                <TouchableOpacity style={[styles.mainButton, styles.resumeButton]} onPress={handleResume}>
                  <Text style={styles.buttonText}>RESUME</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.mainButton, styles.pauseButton]} onPress={handlePause}>
                  <Text style={styles.buttonText}>PAUSE</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={[styles.mainButton, styles.stopButton]} onPress={handleStop}>
                <Text style={styles.buttonText}>STOP</Text>
              </TouchableOpacity>
            </View>
          )}
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
  map: {
    width: '100%',
    height: '100%',
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
  trackingControls: {
    flexDirection: 'row',
    gap: 20,
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
    backgroundColor: '#34C759', // Apple Green
  },
  pauseButton: {
    backgroundColor: '#FF9500', // Orange
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30', // Apple Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
