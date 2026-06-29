import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/useAuthStore';
import api from '../../../src/services/api';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function ProfileScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
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
        fitnessGoals: formData.fitnessGoals.split(',').map((g: string) => g.trim()).filter((g: string) => g),
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveText, { color: theme.primary }]}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                <Text style={[styles.avatarPlaceholderText, { color: isDark ? '#000' : '#fff' }]}>
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.primary }]} onPress={() => Alert.alert('Coming Soon', 'Photo upload requires Cloudinary keys')}>
                <Text style={[styles.editAvatarText, { color: isDark ? '#000' : '#fff' }]}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: theme.text }]}>@{user?.username}</Text>
            {user?.isPremium && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{user?.following?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{user?.followers?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </View>
          </View>
          {!isEditing && (
            <TouchableOpacity style={[styles.findFriendsButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/search')}>
              <Text style={[styles.findFriendsText, { color: isDark ? '#000' : '#fff' }]}>Find Friends</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>{user?.fullName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>{user?.bio || 'No bio yet.'}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Height (cm)</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.value, { color: theme.text }]}>{user?.height || '---'}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.value, { color: theme.text }]}>{user?.weight || '---'}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Fitness Goals</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                value={formData.fitnessGoals}
                onChangeText={(text) => setFormData({ ...formData, fitnessGoals: text })}
                placeholder="Comma separated (e.g. Lose weight, Build muscle)"
                placeholderTextColor={theme.textSecondary}
              />
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>
                {user?.fitnessGoals?.length ? user.fitnessGoals.join(', ') : 'Not set'}
              </Text>
            )}
          </View>
        </View>

        {!isEditing && user?.achievements && user.achievements.length > 0 && (
          <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {user.achievements.map((achievement: any, index: number) => (
                <View key={index} style={[styles.achievementBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={styles.achievementIcon}>{achievement.icon || '🏅'}</Text>
                  <Text style={[styles.achievementTitle, { color: theme.text }]}>{achievement.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {!isEditing && (
          <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            {workouts.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No workouts yet. Go track one!</Text>
            ) : (
              workouts.map((workout: any) => (
                <View key={workout._id} style={[styles.workoutCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={styles.workoutHeader}>
                    <Text style={[styles.workoutTitle, { color: theme.text }]}>{workout.title || workout.activityType}</Text>
                    <Text style={[styles.workoutDate, { color: theme.textSecondary }]}>{new Date(workout.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.workoutStatsRow}>
                    <View style={styles.workoutStat}>
                      <Text style={[styles.workoutStatValue, { color: theme.text }]}>{(workout.distance / 1000).toFixed(2)} km</Text>
                      <Text style={[styles.workoutStatLabel, { color: theme.textSecondary }]}>Distance</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Text style={[styles.workoutStatValue, { color: theme.text }]}>{Math.floor(workout.duration / 60)} min</Text>
                      <Text style={[styles.workoutStatLabel, { color: theme.textSecondary }]}>Time</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Text style={[styles.workoutStatValue, { color: theme.text }]}>{workout.calories} kcal</Text>
                      <Text style={[styles.workoutStatLabel, { color: theme.textSecondary }]}>Calories</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {!isEditing && (
          <TouchableOpacity style={styles.premiumButton} onPress={() => router.push('/premium')}>
            <Text style={styles.premiumButtonText}>✨ FitTrack Premium</Text>
          </TouchableOpacity>
        )}

        {!isEditing && (
          <TouchableOpacity style={[styles.plansButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/plans')}>
            <Text style={[styles.plansButtonText, { color: isDark ? '#000' : '#fff' }]}>Training Plans & Nutrition 🥗</Text>
          </TouchableOpacity>
        )}

        {!isEditing && (
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]} onPress={handleLogout}>
            <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  proBadge: {
    backgroundColor: '#E5A00D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
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
  premiumButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5A00D',
    shadowColor: '#E5A00D',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  premiumButtonText: {
    color: '#E5A00D',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  plansButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  plansButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
