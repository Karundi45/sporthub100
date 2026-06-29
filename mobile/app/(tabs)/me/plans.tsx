import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { router } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function PlansScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data;
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.post(`/plans/${planId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      Alert.alert('Success', 'You are now enrolled in this plan!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
    }
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading plans.</Text></View>;
  }

  const renderPlan = ({ item }: { item: any }) => {
    const isEnrolled = item.enrolledUsers?.includes(user?._id);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <View style={[styles.badge, item.difficulty === 'Beginner' ? { backgroundColor: theme.badgeBeginner } : item.difficulty === 'Intermediate' ? { backgroundColor: theme.badgeInter } : { backgroundColor: theme.badgeAdv }]}>
            <Text style={[styles.badgeText, { color: isDark ? '#000' : '#000' }]}>{item.difficulty}</Text>
          </View>
        </View>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: theme.text }]}>{item.durationWeeks} Weeks</Text>
          <Text style={[styles.statText, { color: theme.text }]}>•</Text>
          <Text style={[styles.statText, { color: theme.text }]}>{item.workoutsPerWeek}x / Week</Text>
        </View>

        {isEnrolled ? (
          <View style={[styles.enrolledBadge, { backgroundColor: isDark ? '#1A3320' : '#E4F8EB' }]}>
            <Text style={[styles.enrolledText, { color: theme.success }]}>Current Plan ✓</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.enrollButton, { backgroundColor: theme.primary }]}
            onPress={() => enrollMutation.mutate(item._id)}
            disabled={enrollMutation.isPending}
          >
            <Text style={[styles.enrollButtonText, { color: isDark ? '#000' : '#fff' }]}>{enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.largeTitle, { color: theme.text }]}>Training Plans</Text>
        </View>

        <FlatList
          data={plans || []}
          keyExtractor={(item) => item._id}
          renderItem={renderPlan}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>No training plans available yet.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
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
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeBeginner: { backgroundColor: '#E5F1FF' },
  badgeInter: { backgroundColor: '#FFF0D9' },
  badgeAdv: { backgroundColor: '#FFEBEB' },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  enrollButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  enrolledBadge: {
    backgroundColor: '#E4F8EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrolledText: {
    color: '#34C759',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
