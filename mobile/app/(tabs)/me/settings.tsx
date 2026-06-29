import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/useAuthStore';
import api from '../../../src/services/api';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const theme = useAppTheme(isDark);
  
  const [profileVisibility, setProfileVisibility] = useState(user?.privacySettings?.profileVisibility === 'public');
  const [activityVisibility, setActivityVisibility] = useState(user?.privacySettings?.activityVisibility === 'public');
  const [saving, setSaving] = useState(false);

  const handleSavePrivacy = async (key: 'profileVisibility' | 'activityVisibility', value: boolean) => {
    try {
      const visibilityString = value ? 'public' : 'private';
      const updatedPrivacy = {
        ...user?.privacySettings,
        [key]: visibilityString
      };

      const res = await api.put('/users/profile', {
        privacySettings: updatedPrivacy
      });

      setUser({ ...user, ...res.data });
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings');
    }
  };

  const handleProfileToggle = (val: boolean) => {
    setProfileVisibility(val);
    handleSavePrivacy('profileVisibility', val);
  };

  const handleActivityToggle = (val: boolean) => {
    setActivityVisibility(val);
    handleSavePrivacy('activityVisibility', val);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>App Appearance</Text>
        
        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Toggle dark theme UI</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#3A3A3C', true: theme.primary }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Privacy Settings</Text>
        
        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Public Profile</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Allow anyone to view your profile</Text>
          </View>
          <Switch 
            value={profileVisibility} 
            onValueChange={handleProfileToggle}
            trackColor={{ false: '#3A3A3C', true: theme.primary }}
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Public Activities</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Show your runs on the global feed</Text>
          </View>
          <Switch 
            value={activityVisibility} 
            onValueChange={handleActivityToggle}
            trackColor={{ false: '#3A3A3C', true: theme.primary }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>FitTrack-Pro v1.0.0</Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Logged in as {user?.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  backBtnText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
