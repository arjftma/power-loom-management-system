import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthMutations } from '../mutations/useAuthMutations';
import { normalize } from '../utils/responsive';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { getSavedLoginEmail, setSavedLoginEmail } from '../utils/lastLoginEmail';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuthMutations();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getSavedLoginEmail();
      if (!cancelled && saved) setEmail(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = () => {
    const e = email.trim();
    const p = password;
    if (!e) {
      Alert.alert('Sign in', 'Please enter your email address.');
      return;
    }
    if (!p) {
      Alert.alert('Sign in', 'Please enter your password.');
      return;
    }
    loginMutation.mutate(
      { email: e, password: p },
      {
        onSuccess: async () => {
          await setSavedLoginEmail(e);
          navigation.replace('Main');
        },
        onError: (err) => Alert.alert('Login failed', err.message),
      }
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={pullRefreshControl(loginMutation.isPending, handleLogin)}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Power loom manager</Text>
          <Text style={styles.subtitle}>
            Fabric production, stock, dispatch, employees, suppliers, customers & payments (FYP 2022–2026).
          </Text>
          <Text style={styles.fieldHint}>
            Use the same email and password as your admin profile. Update them anytime under Business → Profile.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            textContentType="username"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={normalize(24)} color="#4a5568" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.buttonText}>{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: normalize(25),
    borderRadius: normalize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: normalize(24), fontWeight: 'bold', marginBottom: normalize(8), textAlign: 'center', color: '#1a202c' },
  subtitle: {
    fontSize: normalize(13),
    color: '#718096',
    textAlign: 'center',
    marginBottom: normalize(14),
    lineHeight: normalize(20),
    paddingHorizontal: normalize(4),
  },
  fieldHint: { fontSize: normalize(12), color: '#4a5568', marginBottom: normalize(16), textAlign: 'center', lineHeight: normalize(18) },
  label: { fontSize: normalize(13), fontWeight: '600', color: '#2d3748', marginBottom: normalize(6) },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(14),
    marginBottom: normalize(16),
    borderRadius: normalize(8),
    fontSize: normalize(16),
    color: '#2d3748',
    backgroundColor: '#f8fafc',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: normalize(8),
    backgroundColor: '#f8fafc',
    marginBottom: normalize(20),
    paddingRight: normalize(4),
  },
  passwordInput: {
    flex: 1,
    padding: normalize(14),
    fontSize: normalize(16),
    color: '#2d3748',
  },
  eyeBtn: { padding: normalize(10) },
  button: { backgroundColor: '#3182ce', padding: normalize(15), borderRadius: normalize(8), alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#a0aec0' },
  buttonText: { color: '#fff', fontSize: normalize(18), fontWeight: 'bold' },
});
