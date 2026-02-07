
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { findNearbyHealthyOptions } from '../services/geminiService';

const Discover: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const data = await findNearbyHealthyOptions(location.lat, location.lng);
      setResults(data.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Local Explorer</Text>
      <Text style={styles.subtitle}>Find healthy choices near you</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Browse Stores & Eats</Text>
          <Text style={styles.heroDesc}>Koda will check nearby grocery stores and restaurants for healthier options.</Text>
          <TouchableOpacity 
            style={styles.heroButton} 
            onPress={handleSearch} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#059669" />
            ) : (
              <Text style={styles.heroButtonText}>Scan My Area</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.blob} />
      </View>

      {results && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsText}>{results}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 24 },
  heroCard: { backgroundColor: '#0F172A', borderRadius: 32, padding: 24, overflow: 'hidden', position: 'relative' },
  heroContent: { zIndex: 10, gap: 12 },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  heroDesc: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  heroButton: { backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center' },
  heroButtonText: { color: '#059669', fontWeight: '800' },
  blob: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 60 },
  resultsCard: { marginTop: 24, backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  resultsText: { fontSize: 14, color: '#334155', lineHeight: 22 },
});

export default Discover;
