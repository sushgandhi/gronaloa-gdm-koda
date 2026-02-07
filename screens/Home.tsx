
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { HealthMetrics, DailyBriefing } from '../types';
import { getHealthMetrics, getUserPersona, getStoredBriefing, saveBriefing, getMealLogs } from '../services/healthData';
import { generateDailyBriefing } from '../services/geminiService';
import { getWaitroseOffers } from '../services/browserService';
// import { auth } from '../config/firebase'; // Disabled for now

const Home: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<string>('Coach Kai');
  
  // Hardcoded User
  const [user, setUser] = useState({
    displayName: 'Sushant Gandhi',
    email: 'sushant@example.com',
    photoURL: null,
    uid: 'mock-user-sushant'
  });

  // Listen to Auth State - DISABLED
  /*
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      refreshData();
    });
    return () => unsubscribe();
  }, []);
  */

  const refreshData = async () => {
    // 1. Load Persona
    const p = await getUserPersona();
    setPersona(p);

    // 2. Load Health Data (Cloud or Local)
    const data = await getHealthMetrics();
    setMetrics(data);

    // 3. Check for existing briefing
    const existingBriefing = await getStoredBriefing();
    if (existingBriefing) {
      setBriefing(existingBriefing);
    } else {
      // 4. Generate if missing
      fetchNewBriefing(data, p);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const fetchNewBriefing = async (data: HealthMetrics, activePersona: string) => {
    setLoading(true);
    try {
      const meals = await getMealLogs();
      // Fetch offers via Browserbase integration (simulated in service)
      const offers = await getWaitroseOffers();
      
      const b = await generateDailyBriefing(data, meals, activePersona, offers);
      setBriefing(b);
      await saveBriefing(b); // Save to Firestore/Local
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!metrics) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Koda</Text>
          <Text style={styles.subtitle}>
            {user ? `Welcome, ${user.displayName}` : 'Welcome back, Health Seeker'}
          </Text>
        </View>
        <Image 
          source={{ uri: user?.photoURL || `https://picsum.photos/seed/${persona}/100` }} 
          style={styles.avatar}
        />
      </View>

      <View style={styles.briefingCard}>
        <View style={styles.briefingHeader}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>MORNING BRIEFING</Text>
          </View>
          <Text style={styles.personaText}>• from {persona}</Text>
        </View>
        
        {loading ? (
          <View style={styles.loaderContainer}>
             <ActivityIndicator color="white" size="large" />
             <Text style={styles.loaderText}>Generating Daily Briefing...</Text>
          </View>
        ) : briefing ? (
          <View style={styles.briefingBody}>
            <Text style={styles.summaryText}>{briefing.summary}</Text>
            
            {/* Smart Shopping Card */}
            {briefing.shoppingSuggestion && (
              <View style={styles.shoppingCard}>
                <View style={styles.shoppingHeader}>
                    <Text style={styles.shoppingIcon}>🛒</Text>
                    <View>
                        <Text style={styles.shoppingTitle}>Smart Deal Meal</Text>
                        <Text style={styles.shoppingSubtitle}>Sourced from {briefing.shoppingSuggestion.store}</Text>
                    </View>
                </View>
                <Text style={styles.recipeName}>{briefing.shoppingSuggestion.recipeName}</Text>
                <Text style={styles.savingsNote}>{briefing.shoppingSuggestion.savingsNote} ({briefing.shoppingSuggestion.itemOnSale})</Text>
                <View style={styles.ingredientList}>
                    {briefing.shoppingSuggestion.ingredients.map((ing, i) => (
                        <Text key={i} style={styles.ingredient}>• {ing}</Text>
                    ))}
                </View>
                <TouchableOpacity 
                    onPress={() => Linking.openURL('https://www.waitrose.com/ecom/shop/offers/94931')}
                    style={styles.shopBtn}
                >
                    <Text style={styles.shopBtnText}>Shop Deal</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.planHeader}>TOMORROW'S PLAN</Text>
            {briefing.plan.map((item, idx) => (
              <View key={idx} style={styles.planItem}>
                <Text style={styles.planBullet}>✦</Text>
                <Text style={styles.planText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity onPress={() => fetchNewBriefing(metrics, persona)} style={styles.retryButton}>
             <Text style={styles.retryText}>Generate Briefing</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Activity" value={metrics.steps} unit="steps" color="#F97316" icon="⚡" />
        <StatCard label="Sleep" value={metrics.sleepHours} unit="hours" color="#6366F1" icon="🌙" />
        <StatCard label="Heart" value={metrics.heartRate} unit="bpm" color="#F43F5E" icon="❤️" />
        <StatCard label="Glucose" value={metrics.glucose} unit="mg/dL" color="#06B6D4" icon="🩸" />
      </View>
    </ScrollView>
  );
};

const StatCard = ({ label, value, unit, color, icon }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <Text style={styles.statIconText}>{icon}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statValueContainer}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, gap: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#10B981' },
  briefingCard: { backgroundColor: '#059669', borderRadius: 32, padding: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  briefingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  briefingBody: {},
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: 'white', fontSize: 10, fontWeight: '800' },
  personaText: { color: '#D1FAE5', fontSize: 10 },
  loaderContainer: { padding: 20, alignItems: 'center' },
  loaderText: { color: 'white', marginTop: 10, fontSize: 14 },
  summaryText: { color: 'white', fontSize: 18, fontWeight: '600', lineHeight: 24, marginBottom: 20 },
  
  // Shopping Card Styles
  shoppingCard: { backgroundColor: '#F0FDF4', borderRadius: 20, padding: 16, marginBottom: 24 },
  shoppingHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  shoppingIcon: { fontSize: 24 },
  shoppingTitle: { fontSize: 16, fontWeight: '800', color: '#166534' },
  shoppingSubtitle: { fontSize: 12, color: '#15803D' },
  recipeName: { fontSize: 18, fontWeight: 'bold', color: '#14532D', marginBottom: 4 },
  savingsNote: { fontSize: 12, fontStyle: 'italic', color: '#15803D', marginBottom: 12 },
  ingredientList: { marginBottom: 16 },
  ingredient: { fontSize: 13, color: '#166534', marginBottom: 2 },
  shopBtn: { backgroundColor: '#166534', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  shopBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  planHeader: { color: '#D1FAE5', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  planItem: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16, marginBottom: 8 },
  planBullet: { color: '#A7F3D0' },
  planText: { color: 'white', fontSize: 14, flex: 1 },
  retryButton: { padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  retryText: { color: 'white', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statCard: { width: '47%', backgroundColor: 'white', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statIconText: { color: 'white', fontSize: 18 },
  statLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  statValueContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statUnit: { fontSize: 12, color: '#94A3B8' },
});

export default Home;
