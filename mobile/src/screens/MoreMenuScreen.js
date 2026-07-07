import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { normalize } from '../utils/responsive';
import { pullRefreshControl } from '../utils/pullToRefresh';

const TILES = [
  { title: 'Employees', subtitle: 'Weavers & helpers', screen: 'Employees', icon: 'people-outline', color: '#805ad5' },
  { title: 'Suppliers', subtitle: 'Materials & contacts', screen: 'Suppliers', icon: 'cube-outline', color: '#38a169' },
  { title: 'Customers', subtitle: 'Buyers & dispatch', screen: 'Customers', icon: 'business-outline', color: '#00b5d8' },
  { title: 'Payments', subtitle: 'Received & paid', screen: 'Payments', icon: 'wallet-outline', color: '#e53e3e' },
  { title: 'Payroll', subtitle: 'Auto salary & loans', screen: 'Payroll', icon: 'cash-outline', color: '#d69e2e' },
  { title: 'Stock report', subtitle: 'Fabric added by date', screen: 'StockReport', icon: 'bar-chart-outline', color: '#2b6cb0' },
  { title: 'Admin profile', subtitle: 'Account details', screen: 'Profile', color: '#553c9a', icon: 'person-circle-outline' },
  { title: 'Settings', subtitle: 'Logout & preferences', screen: 'Settings', color: '#4a5568', icon: 'settings-outline' },
];

export default function MoreMenuScreen({ navigation }) {
  const queryClient = useQueryClient();
  const [hubRefreshing, setHubRefreshing] = useState(false);
  const onPullRefresh = useCallback(async () => {
    setHubRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setHubRefreshing(false);
    }
  }, [queryClient]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Business',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={pullRefreshControl(hubRefreshing, onPullRefresh)}
      >
        <Text style={styles.intro}>Records, people, and money. Tap a module to open it.</Text>
        <View style={styles.grid}>
          {TILES.map((t) => (
            <TouchableOpacity
              key={t.screen}
              style={[styles.tile, { borderLeftColor: t.color }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(t.screen)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${t.color}18` }]}>
                <Ionicons name={t.icon} size={normalize(26)} color={t.color} />
              </View>
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={styles.tileSub}>{t.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: normalize(16), paddingBottom: normalize(32) },
  intro: { fontSize: normalize(14), color: '#4a5568', marginBottom: normalize(16), lineHeight: normalize(20) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: normalize(12),
    padding: normalize(14),
    marginBottom: normalize(14),
    borderLeftWidth: normalize(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(10),
  },
  tileTitle: { fontSize: normalize(15), fontWeight: '700', color: '#1a202c' },
  tileSub: { fontSize: normalize(12), color: '#718096', marginTop: normalize(4) },
});
