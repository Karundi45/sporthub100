import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/services/api';
import { useThemeStore } from '../src/store/useThemeStore';
import { useAppTheme } from '../src/theme/colors';

export default function CreatePostScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      let photoUrl = null;
      if (photoUri) {
        // Upload photo to cloudinary or your backend
        const formData = new FormData();
        formData.append('file', {
          uri: photoUri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);

        const uploadRes = await api.post('/upload', formData);
        photoUrl = uploadRes.data.url;
      }

      await api.post('/posts', {
        content,
        photos: photoUrl ? [photoUrl] : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.back();
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  });

  const handlePost = () => {
    if (!content.trim() && !photoUri) {
      Alert.alert('Empty Post', 'Please write something or add a photo.');
      return;
    }
    createPostMutation.mutate();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          style={[styles.headerButton, styles.postButton, { backgroundColor: theme.primary }]}
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <ActivityIndicator color={isDark ? '#000' : '#fff'} size="small" />
          ) : (
            <Text style={[styles.postText, { color: isDark ? '#000' : '#fff' }]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <TextInput
          style={[styles.textInput, { color: theme.text }]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.textSecondary}
          multiline
          autoFocus
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />
        
        {photoUri && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
              <Text style={styles.removePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={[styles.addPhotoButton, { borderTopColor: theme.border }]} onPress={pickImage}>
          <Text style={[styles.addPhotoText, { color: theme.primary }]}>📷 Add Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerButton: {
    padding: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  postText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  photoContainer: {
    marginTop: 16,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addPhotoButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
