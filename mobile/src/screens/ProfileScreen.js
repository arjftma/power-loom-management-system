import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';
import { normalize } from '../utils/responsive';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { setSavedLoginEmail } from '../utils/lastLoginEmail';

const fetchProfile = () => customApiCall('get', '/profile');
const updateProfile = (profileData) => customApiCall('put', '/profile/update', profileData);
const changePasswordApi = (body) => customApiCall('post', '/profile/password', body);

export default function ProfileScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerStyle: { backgroundColor: '#2b6cb0' }, headerTintColor: '#fff' });
  }, [navigation]);

  const queryClient = useQueryClient();
  const { data: user, isLoading, isFetching, refetch } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (variables?.email) await setSavedLoginEmail(variables.email);
      Alert.alert('Saved', 'Profile updated. Use this email the next time you sign in.');
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to update profile');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Saved', 'Password updated. Use your new password the next time you sign in.');
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to change password');
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setPhoneNo(user.phone_no || '');
      setCnic(user.cnic || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = () => {
    mutation.mutate({
      full_name: name,
      name,
      username: username || undefined,
      email,
      phone_no: phoneNo || null,
      cnic: cnic || null,
      address: address || null,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Password', 'Enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Password', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password', 'New password and confirmation do not match.');
      return;
    }
    passwordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  };

  if (isLoading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3182ce" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollInner}
          refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Profile</Text>

            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#a0aec0"
              placeholder="Your name"
            />

            <Text style={styles.label}>Sign-in email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#a0aec0"
              placeholder="email@example.com"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#a0aec0"
              placeholder="Login username"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phoneNo}
              onChangeText={setPhoneNo}
              keyboardType="phone-pad"
              placeholderTextColor="#a0aec0"
              placeholder="03xx-xxxxxxx"
            />

            <Text style={styles.label}>CNIC</Text>
            <TextInput
              style={styles.input}
              value={cnic}
              onChangeText={setCnic}
              placeholderTextColor="#a0aec0"
              placeholder="12345-1234567-1"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#a0aec0"
              placeholder="Street, city"
            />

            <TouchableOpacity
              style={[styles.btnPrimary, mutation.isPending && { opacity: 0.7 }]}
              onPress={handleUpdateProfile}
              disabled={mutation.isPending}
            >
              <Text style={styles.btnText}>{mutation.isPending ? 'Saving…' : 'Save profile'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.cardSpaced]}>
            <Text style={styles.title}>Change password</Text>
            <Text style={styles.hint}>Use your current password, then a new one (min. 8 characters). Sign in with the new password after saving.</Text>

            <Text style={styles.label}>Current password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholderTextColor="#a0aec0"
                placeholder="Current password"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent((v) => !v)} accessibilityLabel="Toggle current password visibility">
                <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={normalize(22)} color="#4a5568" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholderTextColor="#a0aec0"
                placeholder="At least 8 characters"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew((v) => !v)} accessibilityLabel="Toggle new password visibility">
                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={normalize(22)} color="#4a5568" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm new password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholderTextColor="#a0aec0"
                placeholder="Repeat new password"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm((v) => !v)} accessibilityLabel="Toggle confirm password visibility">
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={normalize(22)} color="#4a5568" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnSecondary, passwordMutation.isPending && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={passwordMutation.isPending}
            >
              <Text style={styles.btnText}>{passwordMutation.isPending ? 'Updating…' : 'Update password'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: normalize(20), justifyContent: 'flex-start' },
  scrollInner: { flexGrow: 1, paddingBottom: normalize(32) },
  card: {
    backgroundColor: '#fff',
    padding: normalize(20),
    borderRadius: normalize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardSpaced: { marginTop: normalize(16) },
  title: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginBottom: normalize(16),
    color: '#2d3748',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: normalize(10),
  },
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(14), lineHeight: normalize(18) },
  label: { fontSize: normalize(14), fontWeight: '600', color: '#4a5568', marginBottom: normalize(6) },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(12),
    marginBottom: normalize(16),
    borderRadius: normalize(8),
    fontSize: normalize(16),
    color: '#1a202c',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: normalize(8),
    backgroundColor: '#f8fafc',
    marginBottom: normalize(16),
    paddingRight: normalize(4),
  },
  passwordInput: { flex: 1, padding: normalize(12), fontSize: normalize(16), color: '#1a202c' },
  eyeBtn: { padding: normalize(8) },
  btnPrimary: { backgroundColor: '#38a169', padding: normalize(15), borderRadius: normalize(8), alignItems: 'center', marginTop: normalize(4) },
  btnSecondary: { backgroundColor: '#2b6cb0', padding: normalize(15), borderRadius: normalize(8), alignItems: 'center', marginTop: normalize(4) },
  btnText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },
});
