import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function PremiumScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Unlock Your Full Potential</Text>
        <Text style={styles.subtitle}>Get FitTrack Pro Premium</Text>

        <View style={styles.features}>
          <Text style={styles.featureItem}>✓ Unlimited Training Plans</Text>
          <Text style={styles.featureItem}>✓ Offline Maps for Running</Text>
          <Text style={styles.featureItem}>✓ Advanced Analytics & Insights</Text>
          <Text style={styles.featureItem}>✓ Ad-Free Experience</Text>
          <Text style={styles.featureItem}>✓ Custom App Icons</Text>
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity style={styles.pricingCard}>
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>$4.99 / mo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pricingCard, styles.popularCard]}>
            <Text style={styles.popularBadge}>BEST VALUE</Text>
            <Text style={[styles.planTitle, { color: '#fff' }]}>Yearly</Text>
            <Text style={[styles.planPrice, { color: '#fff' }]}>$39.99 / yr</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={() => alert('Mock: Subscribed!')}>
          <Text style={styles.subscribeText}>Subscribe Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>Cancel anytime. Billed automatically.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' }, // Dark theme for premium
  header: { padding: 16, backgroundColor: '#000' },
  backText: { fontSize: 17, color: '#FFD700' }, // Gold color
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#FFD700', marginBottom: 40 },
  features: { width: '100%', marginBottom: 40 },
  featureItem: { fontSize: 18, color: '#fff', marginBottom: 12 },
  pricingContainer: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 40 },
  pricingCard: { flex: 1, backgroundColor: '#1C1C1E', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#1C1C1E' },
  popularCard: { borderColor: '#FFD700', backgroundColor: '#332D00' },
  popularBadge: { position: 'absolute', top: -12, backgroundColor: '#FFD700', color: '#000', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  planTitle: { fontSize: 18, color: '#fff', marginBottom: 8 },
  planPrice: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subscribeButton: { backgroundColor: '#FFD700', width: '100%', padding: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  subscribeText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  disclaimer: { color: '#8E8E93', fontSize: 12 }
});
