import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/services/api';
import { router } from 'expo-router';
import { useThemeStore } from '../src/store/useThemeStore';
import { useAppTheme } from '../src/theme/colors';

export default function NotificationsScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading notifications.</Text></View>;
  }

  const renderNotification = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, !item.read && { backgroundColor: isDark ? '#112211' : '#E5F1FF' }]} 
        onPress={() => {
          if (!item.read) markAsReadMutation.mutate(item._id);
        }}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }, !item.read && { color: theme.primary }]}>{item.title}</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>{item.body}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.primary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.largeTitle, { color: theme.text }]}>Notifications</Text>
          <TouchableOpacity onPress={() => markAllAsReadMutation.mutate()}>
            <Text style={[styles.markAllText, { color: theme.textSecondary }]}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications || []}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textSecondary }]}>You have no notifications.</Text>}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  backBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  markAllText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#E5F1FF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  unreadText: {
    color: '#007AFF',
  },
  body: {
    fontSize: 15,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
});
