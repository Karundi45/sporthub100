import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

const ACTIVITIES = [
  { id: 'Running', icon: '🏃‍♂️', name: 'Running' },
  { id: 'Cycling', icon: '🚴‍♂️', name: 'Cycling' },
  { id: 'Walking', icon: '🚶‍♂️', name: 'Walking' },
  { id: 'Hiking', icon: '🥾', name: 'Hiking' },
  { id: 'Swimming', icon: '🏊‍♂️', name: 'Swimming' },
  { id: 'Yoga', icon: '🧘‍♂️', name: 'Yoga' },
  { id: 'Gym', icon: '🏋️‍♂️', name: 'Gym Workout' },
];

interface ActivitySelectorProps {
  selectedActivity: string;
  onSelectActivity: (activity: string) => void;
  disabled?: boolean;
}

export default function ActivitySelector({ selectedActivity, onSelectActivity, disabled }: ActivitySelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {ACTIVITIES.map((activity) => {
          const isActive = selectedActivity === activity.id;
          return (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityButton,
                isActive && styles.activityButtonActive,
                disabled && styles.activityButtonDisabled,
              ]}
              onPress={() => onSelectActivity(activity.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, isActive && styles.iconActive]}>{activity.icon}</Text>
              <Text style={[styles.name, isActive && styles.nameActive]}>{activity.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    height: 90,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  activityButton: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F4FE',
  },
  activityButtonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  iconActive: {
    opacity: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  nameActive: {
    color: '#007AFF',
  },
});
