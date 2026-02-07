
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Home from './screens/Home';
import Log from './screens/Log';
import Discover from './screens/Discover';
import Profile from './screens/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'log' | 'discover' | 'profile'>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'log': return <Log />;
      case 'discover': return <Discover />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Dash', icon: '🏠' },
    { id: 'log', label: 'Log', icon: '📝' },
    { id: 'discover', label: 'Nearby', icon: '📍' },
    { id: 'profile', label: 'Me', icon: '👤' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.navBar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setActiveTab(item.id)}
            style={styles.navItem}
          >
            <View style={[
              styles.iconContainer,
              activeTab === item.id && styles.activeIconContainer
            ]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text style={[
              styles.navLabel,
              activeTab === item.id && styles.activeNavLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: '#ECFDF5',
  },
  iconText: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeNavLabel: {
    color: '#059669',
  },
});

export default App;
