import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlansAndNutritionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans & Nutrition</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Training Plans</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Couch to 5K</Text>
          <Text style={styles.cardDescription}>8 Weeks • Beginner • 3x/Week</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Join Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Marathon Prep</Text>
          <Text style={styles.cardDescription}>16 Weeks • Advanced • 5x/Week</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Join Plan</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Nutrition Tracking</Text>

        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionIcon}>💧</Text>
            <Text style={styles.nutritionValue}>3 / 8</Text>
            <Text style={styles.nutritionLabel}>Glasses</Text>
            <TouchableOpacity style={styles.smallButton}>
              <Text style={styles.smallButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionIcon}>🔥</Text>
            <Text style={styles.nutritionValue}>1,200</Text>
            <Text style={styles.nutritionLabel}>kcal Intake</Text>
            <TouchableOpacity style={styles.smallButton}>
              <Text style={styles.smallButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backText: { fontSize: 17, color: '#007AFF' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  container: { padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  nutritionGrid: { flexDirection: 'row', gap: 16 },
  nutritionCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  nutritionIcon: { fontSize: 32, marginBottom: 8 },
  nutritionValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  nutritionLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  smallButton: { backgroundColor: '#F2F2F7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  smallButtonText: { color: '#007AFF', fontWeight: 'bold' }
});
