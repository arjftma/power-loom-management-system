import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployees } from '../queries/useEmployees';
import { useEmployeeMutations } from '../mutations/useEmployeeMutations';
import { normalize } from '../utils/responsive';
import EntityContactFields from '../components/EntityContactFields';

const ROLE_WEAVER = 'weaver';
const ROLE_HELPER = 'helper';

const ROLE_LABEL = {
  [ROLE_WEAVER]: 'Weaver',
  [ROLE_HELPER]: 'Helper',
};

export default function EmployeeScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Employees',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isFetching, isError, error, refetch } = useEmployees();
  const { addMutation, deleteMutation } = useEmployeeMutations();
  const [form, setForm] = useState({ role: ROLE_WEAVER });
  const rows = Array.isArray(data) ? data : [];

  const handleAdd = () => {
    addMutation.mutate(
      {
        full_name: form.name,
        father_name: form.father_name || null,
        role: form.role,
        designation: form.designation || form.role,
        department: form.department || null,
        joining_date: form.joining_date || null,
        employment_type: form.employment_type || null,
        status: form.status || 'active',
        cnic: form.cnic || null,
        phone_no: form.phone || null,
        address: form.address || null,
        email: form.email || null,
        basic_salary: form.basic_salary || 0,
      },
      {
        onSuccess: () => setForm({ role: ROLE_WEAVER }),
        onError: (e) => Alert.alert('Could not save', e.message),
      }
    );
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onError: (e) => Alert.alert('Could not delete', e.message),
    });
  };

  const listHeader = (
    <>
      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error?.message ?? 'Failed to load list'}</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.errorRetry}>
            <Text style={styles.errorRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.formPanel}>
        <Text style={styles.formTitle}>Add employee</Text>
        <Text style={styles.hint}>
          Role is stored as weaver or helper only (database rule). Pick one below.
        </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Employee name"
          value={form.name || ''}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <Text style={styles.fieldLabel}>Job role</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeChip, form.role === ROLE_WEAVER && styles.typeChipActive]}
            onPress={() => setForm({ ...form, role: ROLE_WEAVER })}
          >
            <Text style={[styles.typeChipText, form.role === ROLE_WEAVER && styles.typeChipTextActive]}>
              Weaver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeChip, styles.typeChipLast, form.role === ROLE_HELPER && styles.typeChipActive]}
            onPress={() => setForm({ ...form, role: ROLE_HELPER })}
          >
            <Text style={[styles.typeChipText, form.role === ROLE_HELPER && styles.typeChipTextActive]}>
              Helper
            </Text>
          </TouchableOpacity>
        </View>

        <EntityContactFields form={form} setForm={setForm} inputStyle={styles.input} />

        <Text style={styles.fieldLabel}>Father name</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Father name"
          value={form.father_name || ''}
          onChangeText={(t) => setForm({ ...form, father_name: t })}
        />

        <Text style={styles.fieldLabel}>Department</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="e.g. Weaving"
          value={form.department || ''}
          onChangeText={(t) => setForm({ ...form, department: t })}
        />

        <Text style={styles.fieldLabel}>Joining date</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="YYYY-MM-DD"
          value={form.joining_date || ''}
          onChangeText={(t) => setForm({ ...form, joining_date: t })}
        />

        <Text style={styles.fieldLabel}>Employment type</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="e.g. permanent, contract"
          value={form.employment_type || ''}
          onChangeText={(t) => setForm({ ...form, employment_type: t })}
        />

        <Text style={styles.fieldLabel}>Basic salary (Rs)</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Monthly basic pay for payroll"
          value={form.basic_salary != null ? String(form.basic_salary) : ''}
          onChangeText={(t) => setForm({ ...form, basic_salary: t })}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          style={[styles.submitBtn, addMutation.isPending && { opacity: 0.7 }]}
          onPress={handleAdd}
          disabled={addMutation.isPending}
        >
          <Text style={styles.submitBtnText}>{addMutation.isPending ? 'Saving…' : 'Save employee'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Name:</Text> {item.name}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Role:</Text> {ROLE_LABEL[item.role] || item.role}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>CNIC:</Text> {item.cnic ?? '—'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Phone:</Text> {item.phone ?? item.contact_info ?? '—'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Email:</Text> {item.email ?? '—'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Basic salary:</Text> Rs {item.basic_salary ?? 0}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: normalize(24) }}>
            <ActivityIndicator size="large" color="#3182ce" />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: normalize(20) }}
            renderItem={renderItem}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
            keyboardShouldPersistTaps="handled"
            refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: normalize(15), paddingTop: normalize(15) },
  formPanel: {
    backgroundColor: '#fff',
    padding: normalize(15),
    borderRadius: normalize(10),
    marginBottom: normalize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: { fontSize: normalize(16), fontWeight: 'bold', color: '#2d3748', marginBottom: normalize(6) },
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(12) },
  fieldLabel: { fontSize: normalize(12), fontWeight: '600', color: '#4a5568', marginBottom: normalize(4) },
  typeRow: { flexDirection: 'row', marginBottom: normalize(10) },
  typeChip: {
    flex: 1,
    marginRight: normalize(8),
    paddingVertical: normalize(10),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  typeChipLast: { marginRight: 0 },
  typeChipActive: { borderColor: '#3182ce', backgroundColor: '#ebf8ff' },
  typeChipText: { fontSize: normalize(14), color: '#4a5568', fontWeight: '600' },
  typeChipTextActive: { color: '#2b6cb0' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(12),
    marginBottom: normalize(10),
    borderRadius: normalize(6),
    fontSize: normalize(14),
    color: '#2d3748',
  },
  submitBtn: {
    backgroundColor: '#3182ce',
    padding: normalize(14),
    borderRadius: normalize(6),
    alignItems: 'center',
    marginTop: normalize(5),
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: normalize(16) },
  card: {
    backgroundColor: '#fff',
    padding: normalize(15),
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardData: { flex: 1, paddingRight: normalize(10) },
  cardText: { fontSize: normalize(14), color: '#4a5568', marginBottom: normalize(4) },
  label: { fontWeight: 'bold', color: '#2d3748' },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(6),
  },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: normalize(12) },
  emptyText: { textAlign: 'center', color: '#a0aec0', fontSize: normalize(14), marginTop: normalize(20) },
  errorBanner: {
    backgroundColor: '#fff5f5',
    padding: normalize(12),
    borderRadius: normalize(8),
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: '#feb2b2',
  },
  errorBannerText: { color: '#c53030', fontSize: normalize(14), marginBottom: normalize(8) },
  errorRetry: { alignSelf: 'flex-start' },
  errorRetryText: { color: '#3182ce', fontWeight: '600', fontSize: normalize(14) },
});
