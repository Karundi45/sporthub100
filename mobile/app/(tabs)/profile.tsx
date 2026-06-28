import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import api from '../../src/services/api';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    fitnessGoals: user?.fitnessGoals?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        fitnessGoals: user.fitnessGoals?.join(', ') || '',
      });
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data);
    } catch (error) {
      console.log('Failed to fetch workouts', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/users/profile', {
        fullName: formData.fullName,
        bio: formData.bio,
        height: Number(formData.height),
        weight: Number(formData.weight),
        fitnessGoals: formData.fitnessGoals.split(',').map((g) => g.trim()).filter((g) => g),
      });
      setUser(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => Alert.alert('Coming Soon', 'Photo upload requires Cloudinary keys')}>
                <Text style={styles.editAvatarText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
          {!isEditing && (
            <TouchableOpacity style={styles.findFriendsButton} onPress={() => router.push('/search')}>
              <Text style={styles.findFriendsText}>Find Friends</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            ) : (
              <Text style={styles.value}>{user?.fullName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{user?.bio || 'No bio yet.'}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{user?.height || '---'}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{user?.weight || '---'}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fitness Goals</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fitnessGoals}
                onChangeText={(text) => setFormData({ ...formData, fitnessGoals: text })}
                placeholder="Comma separated (e.g. Lose weight, Build muscle)"
              />
            ) : (
              <Text style={styles.value}>
                {user?.fitnessGoals?.length ? user.fitnessGoals.join(', ') : 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {!isEditing && user?.achievements && user.achievements.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {user.achievements.map((achievement: any, index: number) => (
                <View key={index} style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>{achievement.icon || '🏅'}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {!isEditing && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {workouts.length === 0 ? (
              <Text style={styles.emptyText}>No workouts yet. Go track one!</Text>
            ) : (
              workouts.map((workout: any) => (
                <View key={workout._id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutTitle}>{workout.title || workout.activityType}</Text>
                    <Text style={styles.workoutDate}>{new Date(workout.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.workoutStatsRow}>
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{(workout.distance / 1000).toFixed(2)} km</Text>
                      <Text style={styles.workoutStatLabel}>Distance</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{Math.floor(workout.duration / 60)} min</Text>
                      <Text style={styles.workoutStatLabel}>Time</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{workout.calories} kcal</Text>
                      <Text style={styles.workoutStatLabel}>Calories</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {!isEditing && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editText: {
    fontSize: 17,
    color: '#007AFF',
  },
  saveText: {
    fontSize: 17,
    color: '#34C759',
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#8E8E93',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1C1C1E',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 17,
    color: '#1C1C1E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  workoutDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  workoutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 40,
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  findFriendsButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  findFriendsText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  achievementsScroll: {
    flexDirection: 'row',
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 100,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
});
