
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeMealImage } from '../services/geminiService';
import { MealLog } from '../types';

const Log: React.FC = () => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleAnalysis(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleAnalysis(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const handleAnalysis = async (base64: string, uri: string) => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeMealImage(base64);
      const newMeal: MealLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: uri,
        name: analysis.name || 'Unknown Dish',
        calories: analysis.calories || 0,
        protein: analysis.protein || 0,
        carbs: analysis.carbs || 0,
        fats: analysis.fats || 0,
        alternatives: analysis.alternatives || []
      };
      setMeals([newMeal, ...meals]);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Food Log</Text>
      <Text style={styles.subtitle}>Snap a photo to track nutrition</Text>

      <View style={styles.uploadButtons}>
        <TouchableOpacity style={styles.uploadBox} onPress={takePhoto} disabled={analyzing}>
          <Text style={styles.uploadIcon}>📸</Text>
          <Text style={styles.uploadText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage} disabled={analyzing}>
          <Text style={styles.uploadIcon}>🖼️</Text>
          <Text style={styles.uploadText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.analyzingText}>Koda is analyzing nutrients...</Text>
        </View>
      )}

      <View style={styles.mealList}>
        {meals.map(meal => (
          <View key={meal.id} style={styles.mealCard}>
            <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
            <View style={styles.mealInfo}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroText}>P: {meal.protein}g</Text>
                <Text style={styles.macroText}>C: {meal.carbs}g</Text>
                <Text style={styles.macroText}>F: {meal.fats}g</Text>
              </View>
              {meal.alternatives.length > 0 && (
                <View style={styles.swapsBox}>
                  <Text style={styles.swapsTitle}>HEALTHIER SWAPS</Text>
                  <Text style={styles.swapsContent}>{meal.alternatives.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 24 },
  uploadButtons: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  uploadBox: { flex: 1, height: 120, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  analyzingOverlay: { padding: 20, alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 24, marginBottom: 24 },
  analyzingText: { marginTop: 12, fontSize: 14, fontWeight: '700', color: '#065F46' },
  mealList: { gap: 16 },
  mealCard: { backgroundColor: 'white', borderRadius: 24, padding: 12, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  mealImage: { width: 80, height: 80, borderRadius: 16 },
  mealInfo: { flex: 1, gap: 4 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  mealCalories: { fontSize: 14, fontWeight: '700', color: '#059669' },
  macroRow: { flexDirection: 'row', gap: 12 },
  macroText: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  swapsBox: { marginTop: 8, backgroundColor: '#F0FDF4', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7' },
  swapsTitle: { fontSize: 8, fontWeight: '900', color: '#166534', marginBottom: 2 },
  swapsContent: { fontSize: 11, color: '#15803D' },
});

export default Log;
