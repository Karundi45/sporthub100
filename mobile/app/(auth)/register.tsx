import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import api, { setAuthToken } from '../../src/services/api';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAppTheme } from '../../src/theme/colors';

export default function RegisterScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/register', { username, fullName, email, password });
      
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      setAuthToken(token);
      
      router.replace('/(auth)/profile-setup');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join FitTrack Pro today</Text>
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Full Name"
              placeholderTextColor={theme.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Username"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister} disabled={loading}>
              <Text style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>Already have an account? <Text style={[styles.linkTextBold, { color: theme.primary }]}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 52,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  button: {
    height: 52,
    backgroundColor: '#34C759', // Apple Green
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
  },
});
