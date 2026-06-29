import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useAuthStore } from '../store/useAuthStore';
import { socketService } from './socket';

export const LOCATION_TASK_NAME = 'background-location-task';

// Create a global store for background locations so the UI can read them
class LocationStore {
  private static instance: LocationStore;
  private locations: any[] = [];
  private distance: number = 0;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): LocationStore {
    if (!LocationStore.instance) {
      LocationStore.instance = new LocationStore();
    }
    return LocationStore.instance;
  }

  addLocation(location: Location.LocationObject) {
    const newPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(location.timestamp),
    };

    if (this.locations.length > 0) {
      const lastPoint = this.locations[this.locations.length - 1];
      this.distance += this.getDistanceFromLatLonInM(
        lastPoint.latitude, lastPoint.longitude,
        newPoint.latitude, newPoint.longitude
      );
    }

    this.locations.push(newPoint);
    this.notifyListeners();

    // Broadcast live location if socket is connected
    const user = useAuthStore.getState().user;
    if (socketService.socket && user) {
      socketService.socket.emit('update_location', {
        userId: user._id,
        username: user.username,
        location: newPoint,
      });
    }
  }

  getRoute() {
    return [...this.locations];
  }

  getDistance() {
    return this.distance;
  }

  clear() {
    this.locations = [];
    this.distance = 0;
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  private getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }
}

export const locationStore = LocationStore.getInstance();

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      // Process each location update
      locations.forEach(loc => locationStore.addLocation(loc));
    }
  }
});
