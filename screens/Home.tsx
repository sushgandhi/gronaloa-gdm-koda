
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { HealthMetrics, DailyBriefing } from '../types';
import { getSimulatedHealthData, getUserPersona } from '../services/healthData';
import { generateDailyBriefing } from '../services/geminiService';

const Home: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<string>('Coach Kai');

  useEffect(() => {
    const init = async () => {
      // 1. Load Persona
      const p = await getUserPersona();
      setPersona(p);

      // 2. Load Health Data
      const data = getSimulatedHealthData();
      setMetrics(data);

      // 3. Fetch Briefing using the loaded persona
      fetchBriefing(data, p);
    };
    init();
  }, []);

  const fetchBriefing = async (data: HealthMetrics, activePersona: string) => {
    setLoading(true);
    try {
      const b = await generateDailyBriefing(data, [], activePersona);
      setBriefing(b);
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
          <Text style={styles.subtitle}>Welcome back, Health Seeker</Text>
        </View>
        <Image 
          source={{ uri: `https://picsum.photos/seed/${persona}/100` }} 
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
          <ActivityIndicator color="white" style={styles.loader} />
        ) : briefing ? (
          <View style={styles.briefingBody}>
            <Text style={styles.summaryText}>{briefing.summary}</Text>
            <Text style={styles.planHeader}>TOMORROW'S PLAN</Text>
            {briefing.plan.map((item, idx) => (
              <View key={idx} style={styles.planItem}>
                <Text style={styles.planBullet}>✦</Text>
                <Text style={styles.planText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity onPress={() => fetchBriefing(metrics, persona)} style={styles.retryButton}>
             <Text style={styles.retryText}>Refresh Briefing</Text>
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
  loader: { padding: 20 },
  summaryText: { color: 'white', fontSize: 18, fontWeight: '600', lineHeight: 24, marginBottom: 16 },
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
