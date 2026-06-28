import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { useAuthStore } from '../src/store/useAuthStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() !== '') {
        searchUsers(query);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchUsers = async (q: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/users/search?q=${q}`);
      setUsers(response.data);
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser: any) => {
    const isFollowing = currentUser?.following?.includes(targetUser._id);
    try {
      if (isFollowing) {
        await api.post(`/users/${targetUser._id}/unfollow`);
        setUser({
          ...currentUser,
          following: currentUser.following.filter((id: string) => id !== targetUser._id),
        });
      } else {
        await api.post(`/users/${targetUser._id}/follow`);
        setUser({
          ...currentUser,
          following: [...(currentUser.following || []), targetUser._id],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update follow status');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isFollowing = currentUser?.following?.includes(item._id);

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          {item.profilePicture ? (
            <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{item.fullName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.fullName}>{item.fullName}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={() => handleFollowToggle(item)}
        >
          <Text style={[styles.followText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, groups, plans..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            query.trim() !== '' && !loading ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  username: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingText: {
    color: '#1C1C1E',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});
