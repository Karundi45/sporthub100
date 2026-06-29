import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/useAuthStore';
import api from '../../../src/services/api';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAppTheme } from '../../../src/theme/colors';

export default function PremiumScreen() {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await api.post('/users/upgrade');
      setUser({ ...user, ...response.data });
      Alert.alert('Congratulations! 🎉', 'You are now a FitTrack-Pro Premium member!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upgrade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.primary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Unlock Your True Potential</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Get the most out of FitTrack with our premium features designed for serious athletes.</Text>

          <View style={styles.featuresList}>
            <FeatureItem icon="📊" title="Advanced Analytics" description="Deep dive into your performance metrics and historical trends." />
            <FeatureItem icon="🗺️" title="Personal Heatmaps" description="Visualize all your runs on a single interactive map." />
            <FeatureItem icon="🥗" title="Nutrition Integration" description="Sync your daily macros alongside your workout data." />
            <FeatureItem icon="🏆" title="Exclusive Challenges" description="Participate in premium-only challenges with massive XP rewards." />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {user?.isPremium ? (
          <View style={styles.activeContainer}>
            <Text style={styles.activeText}>You are a Premium Member!</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.upgradeButtonText}>Upgrade for $4.99/mo</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }: { icon: string, title: string, description: string }) {
  const { isDark } = useThemeStore();
  const theme = useAppTheme(isDark);
  return (
    <View style={[styles.featureItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Dark aesthetic for Premium
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  backBtnText: {
    fontSize: 17,
    color: '#E5A00D', // Gold color
  },
  content: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E5A00D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  upgradeButton: {
    backgroundColor: '#E5A00D',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#E5A00D',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  activeContainer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  activeText: {
    color: '#E5A00D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
