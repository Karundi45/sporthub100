import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import api, { API_URL } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAppTheme } from '../../src/theme/colors';

const SOCKET_URL = API_URL.replace('/api', '');

interface Message {
  _id: string;
  text: string;
  sender: { _id: string; username: string };
  createdAt: string;
}

export default function ChatScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/groups/${groupId}/messages`);
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };
    if (groupId) {
      fetchMessages();
    }

    // Initialize Socket
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_group', groupId);
    });

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.username !== currentUser?.username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) return [...prev, data.username];
          return prev;
        });
      }
    });

    socketRef.current.on('user_stopped_typing', (data) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    });

    return () => {
      socketRef.current?.emit('leave_group', groupId);
      socketRef.current?.disconnect();
    };
  }, [groupId]);

  const handleSend = async () => {
    if (!inputText.trim() || !groupId) return;
    
    try {
      const res = await api.post(`/groups/${groupId}/messages`, { text: inputText });
      const newMessage = res.data;
      
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      socketRef.current?.emit('send_message', { groupId, message: newMessage });
      socketRef.current?.emit('stop_typing', { groupId, username: currentUser?.username });
      
      setInputText('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    
    if (socketRef.current && groupId) {
      socketRef.current.emit('typing', { groupId, username: currentUser?.username });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { groupId, username: currentUser?.username });
      }, 2000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender._id === currentUser?._id;
    return (
      <View style={[styles.messageBubble, isMe ? { backgroundColor: theme.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 } : { backgroundColor: theme.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border }]}>
        {!isMe && <Text style={[styles.senderName, { color: theme.textSecondary }]}>{item.sender.username}</Text>}
        <Text style={[isMe ? { color: isDark ? '#000' : '#fff', fontSize: 16 } : { color: theme.text, fontSize: 16 }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: theme.primary }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Group Chat</Text>
          <View style={{ width: 50 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {typingUsers.length > 0 && (
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </Text>
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Message..."
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={handleSend}>
            <Text style={[styles.sendButtonText, { color: isDark ? '#000' : '#fff' }]}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backText: { fontSize: 17, color: '#007AFF' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  messagesContainer: { padding: 16, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E5EA' },
  myMessageText: { color: '#fff', fontSize: 16 },
  theirMessageText: { color: '#000', fontSize: 16 },
  senderName: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E5EA', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16, maxHeight: 100 },
  sendButton: { marginLeft: 12, backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  typingText: { paddingHorizontal: 16, paddingBottom: 8, color: '#8E8E93', fontStyle: 'italic', fontSize: 12 }
});
