import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutations } from '../mutations/useAuthMutations';
import { normalize } from '../utils/responsive';
import { resetToLogin } from '../navigation/rootNavigation';
import { pullRefreshControl } from '../utils/pullToRefresh';

export default function SettingsScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerStyle: { backgroundColor: '#2b6cb0' }, headerTintColor: '#fff' });
  }, [navigation]);

  const { logoutMutation } = useAuthMutations();
  const queryClient = useQueryClient();
  const [settingsRefreshing, setSettingsRefreshing] = useState(false);
  const onPullRefresh = useCallback(async () => {
    setSettingsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    } finally {
      setSettingsRefreshing(false);
    }
  }, [queryClient]);

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSuccess: () => resetToLogin()
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f4f8'}}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={pullRefreshControl(settingsRefreshing, onPullRefresh)}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>System Settings</Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.btnText}>👤 Edit Admin Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDanger} onPress={handleLogout}>
              <Text style={styles.btnTextDanger}>🚪 Secure Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: normalize(20) },
  card: { backgroundColor: '#fff', padding: normalize(20), borderRadius: normalize(15), shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  title: { fontSize: normalize(22), fontWeight: 'bold', marginBottom: normalize(25), color: '#1a202c', textAlign: 'center' },
  btnPrimary: { backgroundColor: '#3182ce', padding: normalize(15), borderRadius: normalize(8), marginBottom: normalize(15), alignItems: 'center' },
  btnText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },
  btnDanger: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#feb2b2', padding: normalize(15), borderRadius: normalize(8), alignItems: 'center', marginTop: normalize(20) },
  btnTextDanger: { color: '#c53030', fontSize: normalize(16), fontWeight: 'bold' }
});