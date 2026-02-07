
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';
import { findNearbyHealthyOptions } from '../services/geminiService';

const Discover: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
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
      setSources(data.sources);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/healthy+food/@${location.lat},${location.lng},14z`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Local Explorer</Text>
      <Text style={styles.subtitle}>Find healthy choices near you</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Browse Stores & Eats</Text>
          <Text style={styles.heroDesc}>Koda will check nearby grocery stores and restaurants for healthier options.</Text>
          <View style={styles.buttonRow}>
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
            
            {!loading && location && (
              <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
                <Text style={styles.mapButtonText}>Open Maps 🗺️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.blob} />
      </View>

      {results && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsText}>{results}</Text>
          
          {sources.length > 0 && (
            <View style={styles.sourcesSection}>
              <Text style={styles.sourcesLabel}>Sources from Google Search:</Text>
              <View style={styles.sourcesList}>
                {sources.map((source, index) => {
                  if (source.web) {
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => Linking.openURL(source.web.uri)}
                        style={styles.sourceChip}
                      >
                        <Text style={styles.sourceText} numberOfLines={1}>
                          {source.web.title}
                        </Text>
                        <Text style={styles.linkIcon}>↗</Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 24 },
  heroCard: { backgroundColor: '#0F172A', borderRadius: 32, padding: 24, overflow: 'hidden', position: 'relative' },
  heroContent: { zIndex: 10, gap: 12 },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  heroDesc: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  heroButton: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flex: 1 },
  heroButtonText: { color: '#059669', fontWeight: '800' },
  mapButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  mapButtonText: { color: 'white', fontWeight: '700' },
  blob: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 60 },
  resultsCard: { marginTop: 24, backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  resultsText: { fontSize: 15, color: '#334155', lineHeight: 24 },
  sourcesSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  sourcesLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 8 },
  sourcesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, maxWidth: '100%', gap: 6 },
  sourceText: { fontSize: 11, color: '#475569', fontWeight: '600', maxWidth: 200 },
  linkIcon: { fontSize: 10, color: '#94A3B8' }
});

export default Discover;
