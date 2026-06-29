import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Map(props: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map is not supported on the web version.</Text>
      <Text style={styles.subtext}>Please download the Android APK to view interactive GPS maps.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  }
});
