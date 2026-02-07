
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

  // Simple formatting helper for Markdown-style text (Bold ** and Bullet points *)
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle Bullet Points
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const cleanLine = line.replace(/^[\*\-]\s*/, '');
        return (
          <View key={index} style={styles.mdListItem}>
            <Text style={styles.mdBullet}>•</Text>
            <Text style={styles.mdText}>
              {parseBold(cleanLine)}
            </Text>
          </View>
        );
      }
      
      // Handle Headings (simple check)
      if (line.trim().startsWith('#')) {
        const cleanLine = line.replace(/^#+\s*/, '');
        return (
          <Text key={index} style={styles.mdHeading}>
            {cleanLine}
          </Text>
        );
      }

      // Regular Paragraphs (ignore empty lines for spacing)
      if (line.trim().length === 0) {
         return <View key={index} style={{ height: 8 }} />;
      }

      return (
        <Text key={index} style={styles.mdParagraph}>
          {parseBold(line)}
        </Text>
      );
    });
  };

  // Helper to parse **bold** text inside a string
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={styles.mdBold}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={i}>{part}</Text>;
    });
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
          <View style={styles.markdownContainer}>
            {renderMarkdown(results)}
          </View>
          
          {sources.length > 0 && (
            <View style={styles.sourcesSection}>
              <Text style={styles.sourcesLabel}>Locations Found</Text>
              <View style={styles.sourcesList}>
                {sources.map((source, index) => {
                  const mapSource = source.maps;
                  const webSource = source.web;

                  if (mapSource) {
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => Linking.openURL(mapSource.uri)}
                        style={styles.placeCard}
                      >
                        <View style={styles.placeIcon}>
                           <Text style={{fontSize: 20}}>📍</Text>
                        </View>
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{mapSource.title}</Text>
                          <Text style={styles.placeAction}>View on Google Maps</Text>
                        </View>
                        <Text style={styles.arrowIcon}>→</Text>
                      </TouchableOpacity>
                    );
                  }
                  
                  if (webSource) {
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => Linking.openURL(webSource.uri)}
                        style={styles.placeCard}
                      >
                         <View style={styles.placeIcon}>
                           <Text style={{fontSize: 20}}>🌐</Text>
                        </View>
                        <View style={styles.placeInfo}>
                          <Text style={styles.placeName}>{webSource.title}</Text>
                          <Text style={styles.placeAction}>Visit Website</Text>
                        </View>
                        <Text style={styles.arrowIcon}>→</Text>
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
  resultsCard: { marginTop: 24, backgroundColor: 'white', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  
  // Markdown Styles
  markdownContainer: { gap: 4 },
  mdParagraph: { fontSize: 15, color: '#334155', lineHeight: 24 },
  mdHeading: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 12, marginBottom: 8 },
  mdListItem: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingRight: 12 },
  mdBullet: { fontSize: 16, color: '#059669', lineHeight: 24 },
  mdText: { fontSize: 15, color: '#334155', lineHeight: 24, flex: 1 },
  mdBold: { fontWeight: '700', color: '#0F172A' },

  // Sources/Places Styles
  sourcesSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  sourcesLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sourcesList: { gap: 12 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  placeIcon: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  placeAction: { fontSize: 12, color: '#059669', marginTop: 2 },
  arrowIcon: { fontSize: 18, color: '#CBD5E1', fontWeight: '800' }
});

export default Discover;
