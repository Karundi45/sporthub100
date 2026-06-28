import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/useAuthStore';

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
  const queryClient = useQueryClient();
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
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{item.user.fullName}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        
        {item.content ? <Text style={styles.content}>{item.content}</Text> : null}
        
        {item.workout && (
          <View style={styles.workoutEmbed}>
            <Text style={styles.workoutTitle}>Completed: {item.workout.title}</Text>
            <Text style={styles.workoutStats}>
              {(item.workout.distance / 1000).toFixed(2)} km in {Math.floor(item.workout.duration / 60)} mins
            </Text>
          </View>
        )}

        {item.photos && item.photos.length > 0 && (
          <Image source={{ uri: item.photos[0] }} style={styles.image} />
        )}
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {isLiked ? '❤️' : '🤍'} {item.likes.length} Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setCommentingOn(commentingOn === item._id ? null : item._id)}>
            <Text style={styles.actionText}>💬 {item.comments?.length || 0} Comments</Text>
          </TouchableOpacity>
        </View>

        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsList}>
            {item.comments.slice(0, 3).map((comment: any, index: number) => (
              <View key={index} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.user?.username}: </Text>
                <Text style={styles.commentTextContent}>{comment.text}</Text>
              </View>
            ))}
            {item.comments.length > 3 && (
              <Text style={styles.moreComments}>View all {item.comments.length} comments</Text>
            )}
          </View>
        )}

        {commentingOn === item._id && (
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              autoFocus
            />
            <TouchableOpacity onPress={() => handleCommentSubmit(item._id)} style={styles.postCommentButton}>
              <Text style={styles.postCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.largeTitle}>Activity</Text>
        <FlatList
          data={data?.posts || []}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Follow friends or go for a run!</Text>
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
    marginBottom: 15,
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
    color: '#8E8E93',
    marginTop: 2,
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
