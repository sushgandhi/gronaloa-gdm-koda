
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Persona } from '../types';
import { saveUserPersona, getUserPersona } from '../services/healthData';

const Profile: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('Coach Kai');

  useEffect(() => {
    const load = async () => {
      const p = await getUserPersona();
      setSelectedPersona(p);
    };
    load();
  }, []);

  const handlePersonaChange = async (p: Persona) => {
    setSelectedPersona(p);
    await saveUserPersona(p);
  };

  const personas = [
    { id: Persona.COACH, desc: "Action-oriented, motivational, and firm.", color: "#10B981" },
    { id: Persona.SCIENTIST, desc: "Data-driven, clinical, and precise.", color: "#3B82F6" },
    { id: Persona.FRIEND, desc: "Supportive, casual, and empathetic.", color: "#F43F5E" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://picsum.photos/seed/${selectedPersona}/200` }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.personaName}>{selectedPersona}</Text>
        <Text style={styles.personaRole}>Your Virtual Health Assistant</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose Assistant Persona</Text>
      <View style={styles.personaGrid}>
        {personas.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => handlePersonaChange(p.id as Persona)}
            style={[
              styles.personaCard,
              selectedPersona === p.id && styles.activePersonaCard
            ]}
          >
            <View style={[styles.personaIcon, { backgroundColor: p.color }]}>
              <Text style={styles.personaIconText}>{p.id.charAt(0)}</Text>
            </View>
            <View style={styles.personaInfo}>
              <Text style={styles.personaLabel}>{p.id}</Text>
              <Text style={styles.personaDesc}>{p.desc}</Text>
            </View>
            {selectedPersona === p.id && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sync with Apple Health</Text>
          <View style={styles.toggleActive} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sync with Google Fit</Text>
          <View style={styles.toggleInactive} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  personaName: { fontSize: 24, fontWeight: '800', marginTop: 16, color: '#1E293B' },
  personaRole: { fontSize: 14, color: '#64748B' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  personaGrid: { gap: 12, marginBottom: 32 },
  personaCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', gap: 16 },
  activePersonaCard: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  personaIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  personaIconText: { color: 'white', fontWeight: '800', fontSize: 20 },
  personaInfo: { flex: 1 },
  personaLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  personaDesc: { fontSize: 11, color: '#64748B' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  checkText: { color: 'white', fontWeight: '800' },
  settingsSection: { backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  settingLabel: { fontSize: 14, color: '#475569' },
  toggleActive: { width: 40, height: 22, borderRadius: 11, backgroundColor: '#10B981' },
  toggleInactive: { width: 40, height: 22, borderRadius: 11, backgroundColor: '#E2E8F0' },
});

export default Profile;
