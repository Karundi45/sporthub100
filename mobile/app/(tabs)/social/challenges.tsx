import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/useAuthStore';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  participants: any[];
}

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = React.useState('challenges');
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state: any) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await api.get('/challenges');
      return res.data;
    }
  });

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/challenges/leaderboard');
      return res.data;
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      await api.post(`/challenges/${challengeId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      Alert.alert('Success', 'You have joined the challenge!');
    }
  });

  if (isLoading || isLoadingLeaderboard) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF9500" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading challenges.</Text></View>;
  }

  const renderChallenge = ({ item }: { item: Challenge }) => {
    const participant = item.participants.find((p: any) => p.user === currentUser?._id);
    const isParticipating = !!participant;
    const progress = participant ? participant.progress : 0;
    const completed = participant ? participant.completed : false;
    const progressPercentage = Math.min(100, (progress / item.targetValue) * 100);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }, completed && { backgroundColor: '#34C759' }]} /> 
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {isParticipating 
                ? `${progress.toFixed(0)} / ${item.targetValue} ${item.type === 'distance' ? 'm' : ''}` 
                : `${item.participants.length} Participants`}
            </Text>
            {completed ? (
              <Text style={styles.completedText}>Completed 🏆</Text>
            ) : isParticipating ? (
              <Text style={styles.joinedText}>Joined ✓</Text>
            ) : (
              <TouchableOpacity style={styles.joinButton} onPress={() => joinMutation.mutate(item._id)}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.leaderboardRow}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.leaderboardUser}>
        <Text style={styles.leaderboardName}>{item.fullName}</Text>
        <Text style={styles.leaderboardUsername}>@{item.username}</Text>
      </View>
      <View style={styles.leaderboardStats}>
        <Text style={styles.statScore}>{(item.totalDistance / 1000).toFixed(1)} km</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.largeTitle}>Compete</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'challenges' ? (
          <FlatList
            data={data || []}
            keyExtractor={(item) => item._id}
            renderItem={renderChallenge}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.leaderboardCard}>
            <FlatList
              data={leaderboardData || []}
              keyExtractor={(item) => item._id}
              renderItem={renderLeaderboardItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}
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
    backgroundColor: '#FFF0D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    width: 30,
  },
  leaderboardUser: {
    flex: 1,
    paddingHorizontal: 12,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  leaderboardUsername: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  statScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 58,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  joinedText: {
    color: '#34C759',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
