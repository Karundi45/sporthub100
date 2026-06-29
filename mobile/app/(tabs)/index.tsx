import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/useAuthStore';
import api from '../../src/services/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAppTheme } from '../../src/theme/colors';

interface Post {
  _id: string;
  user: { _id: string; username: string; fullName: string; profilePicture: string };
  content: string;
  photos: string[];
  likes: string[];
  comments: any[];
  createdAt: string;
  workout?: any;
}

export default function FeedScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [liveFriends, setLiveFriends] = useState<{[key: string]: any}>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on('friend_location_update', (data: any) => {
      setLiveFriends(prev => ({
        ...prev,
        [data.userId]: {
          username: data.username,
          latitude: data.latitude,
          longitude: data.longitude,
          lastUpdate: new Date(),
        }
      }));
    });

    return () => {
      newSocket.off('friend_location_update');
      newSocket.disconnect();
    };
  }, []);
  const currentUser = useAuthStore((state) => state.user);
  const [commentingOn, setCommentingOn] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await api.get('/posts/feed');
      return res.data;
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.put(`/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      await api.post(`/posts/${postId}/comment`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setCommentingOn(null);
      setCommentText('');
    }
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>Error loading feed.</Text></View>;
  }

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleCommentSubmit = (postId: string) => {
    if (commentText.trim()) {
      commentMutation.mutate({ postId, text: commentText });
    }
  };

  const renderItem = ({ item }: { item: Post }) => {
    const isLiked = item.likes.includes(currentUser?._id);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: isDark ? 'transparent' : '#000' }]}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: isDark ? '#000' : '#fff' }]}>{item.user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.name, { color: theme.text }]}>{item.user.fullName}</Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        
        {item.content ? <Text style={[styles.content, { color: theme.text }]}>{item.content}</Text> : null}
        
        {item.workout && (
          <View style={[styles.workoutEmbed, { backgroundColor: theme.background, borderLeftColor: theme.success }]}>
            <Text style={[styles.workoutTitle, { color: theme.text }]}>Completed: {item.workout.title}</Text>
            <Text style={[styles.workoutStats, { color: theme.textSecondary }]}>
              {(item.workout.distance / 1000).toFixed(2)} km in {Math.floor(item.workout.duration / 60)} mins
            </Text>
          </View>
        )}

        {item.photos && item.photos.length > 0 && (
          <Image source={{ uri: item.photos[0] }} style={[styles.image, { backgroundColor: theme.background }]} />
        )}
        
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
            <Text style={[styles.actionText, isLiked ? { color: theme.error } : { color: theme.textSecondary }]}>
              {isLiked ? '❤️' : '🤍'} {item.likes.length} Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setCommentingOn(commentingOn === item._id ? null : item._id)}>
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>💬 {item.comments?.length || 0} Comments</Text>
          </TouchableOpacity>
        </View>

        {item.comments && item.comments.length > 0 && (
          <View style={[styles.commentsList, { borderTopColor: theme.border }]}>
            {item.comments.slice(0, 3).map((comment: any, index: number) => (
              <View key={index} style={styles.commentItem}>
                <Text style={[styles.commentUser, { color: theme.text }]}>{comment.user?.username}: </Text>
                <Text style={[styles.commentTextContent, { color: theme.text }]}>{comment.text}</Text>
              </View>
            ))}
            {item.comments.length > 3 && (
              <Text style={[styles.moreComments, { color: theme.textSecondary }]}>View all {item.comments.length} comments</Text>
            )}
          </View>
        )}

        {commentingOn === item._id && (
          <View style={[styles.commentInputRow, { borderTopColor: theme.border }]}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              autoFocus
            />
            <TouchableOpacity onPress={() => handleCommentSubmit(item._id)} style={styles.postCommentButton}>
              <Text style={[styles.postCommentText, { color: theme.primary }]}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={[styles.largeTitle, { color: theme.text }]}>Activity</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.bellButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: theme.primary }]} 
              onPress={() => router.push('/create-post')}
            >
              <Text style={[styles.createButtonText, { color: isDark ? '#000' : '#fff' }]}>+ Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {Object.keys(liveFriends).length > 0 && (
          <View style={styles.liveSection}>
            <Text style={styles.liveSectionTitle}>🔴 Live Now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(liveFriends).map(([id, friend]: [string, any]) => (
                <View key={id} style={styles.liveAvatarContainer}>
                  <View style={[styles.liveAvatar, { backgroundColor: theme.primary, borderColor: theme.error }]}>
                    <Text style={[styles.liveAvatarText, { color: isDark ? '#000' : '#fff' }]}>{friend.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.liveUsername, { color: theme.text }]}>{friend.username}</Text>
                  <View style={[styles.liveBadge, { backgroundColor: theme.error, borderColor: theme.surface }]} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={data?.posts || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No posts yet. Follow friends or go for a run!</Text>
            </View>
          }
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
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bellButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    color: '#FF3B30',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 13,
    color: '#3A3A3C',
    marginTop: 8,
  },
  liveSection: {
    marginBottom: 15,
  },
  liveSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  liveAvatarContainer: {
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  liveAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  liveAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  liveUsername: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: '#FF3B30',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#E5E5EA',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
    paddingTop: 12,
  },
  actionButton: {
    marginRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  likedText: {
    color: '#FF3B30',
  },
  workoutEmbed: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  workoutStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  commentsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTextContent: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  moreComments: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  postCommentButton: {
    marginLeft: 12,
  },
  postCommentText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
  },
});
