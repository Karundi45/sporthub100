import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Alert, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';

interface Group {
  _id: string;
  name: string;
  description: string;
  members: string[];
  isPrivate: boolean;
}

export default function GroupsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDesc, setNewGroupDesc] = React.useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data;
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await api.post(`/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      Alert.alert('Success', 'You have joined the group!');
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/groups', { name: newGroupName, description: newGroupDesc });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreating(false);
      setNewGroupName('');
      setNewGroupDesc('');
    }
  });

  const handleGroupPress = (group: Group) => {
    const isMember = group.members.some((id: any) => id === currentUser?._id || id._id === currentUser?._id);
    if (isMember) {
      router.push(`/chat/${group._id}`);
    } else {
      joinMutation.mutate(group._id);
    }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  const renderGroup = ({ item }: { item: Group }) => {
    const isMember = item.members.some((id: any) => id === currentUser?._id || id._id === currentUser?._id);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleGroupPress(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isMember ? 'Member' : 'Join'}</Text>
          </View>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.membersCount}>{item.members.length} Members</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Community</Text>
          <TouchableOpacity onPress={() => setIsCreating(!isCreating)}>
            <Text style={styles.createText}>{isCreating ? 'Cancel' : 'Create'}</Text>
          </TouchableOpacity>
        </View>

        {isCreating && (
          <View style={styles.createContainer}>
            <TextInput style={styles.input} placeholder="Group Name" value={newGroupName} onChangeText={setNewGroupName} />
            <TextInput style={styles.input} placeholder="Description" value={newGroupDesc} onChangeText={setNewGroupDesc} />
            <TouchableOpacity style={styles.submitButton} onPress={() => createMutation.mutate()}>
              <Text style={styles.submitButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={data || []}
          keyExtractor={(item) => item._id}
          renderItem={renderGroup}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No groups available.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  largeTitle: { fontSize: 34, fontWeight: '700', color: '#000', letterSpacing: 0.5 },
  createText: { fontSize: 17, color: '#007AFF', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#000', flex: 1 },
  badge: { backgroundColor: '#E5F1FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#007AFF', fontSize: 13, fontWeight: 'bold' },
  description: { fontSize: 15, color: '#8E8E93', marginBottom: 12 },
  membersCount: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  createContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 },
  input: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  submitButton: { backgroundColor: '#34C759', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
