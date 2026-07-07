import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeLoans } from '../queries/usePayroll';
import { useEmployees } from '../queries/useEmployees';
import { usePayrollMutations } from '../mutations/usePayrollMutations';
import PickerField from '../components/PickerField';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { normalize } from '../utils/responsive';

function fmtRs(n) {
  return `Rs ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function EmployeeLoansScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Employee loans',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data: loansRaw, isLoading, isFetching, refetch } = useEmployeeLoans();
  const { data: employeesRaw } = useEmployees();
  const { createLoan } = usePayrollMutations();
  const [form, setForm] = useState({});

  const loans = Array.isArray(loansRaw) ? loansRaw : [];
  const employees = Array.isArray(employeesRaw) ? employeesRaw : [];

  const handleAdd = () => {
    if (!form.employee_id) {
      Alert.alert('Employee', 'Select an employee.');
      return;
    }
    createLoan.mutate(
      {
        employee_id: Number(form.employee_id),
        title: form.title || 'Salary loan',
        principal_amount: form.principal_amount,
        installment_amount: form.installment_amount,
      },
      {
        onSuccess: () => setForm({}),
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const listHeader = (
    <View style={styles.formPanel}>
      <Text style={styles.formTitle}>Register employee loan</Text>
      <Text style={styles.hint}>Installments are deducted automatically when you generate payroll.</Text>
      <Text style={styles.label}>Employee</Text>
      <PickerField
        items={employees}
        valueId={form.employee_id}
        onChange={(id) => setForm((p) => ({ ...p, employee_id: id }))}
        placeholder="Select employee"
        modalTitle="Employee"
        inputStyle={styles.input}
      />
      <TextInput
        style={styles.input}
        placeholder="Loan title"
        value={form.title || ''}
        onChangeText={(t) => setForm({ ...form, title: t })}
        placeholderTextColor="#a0aec0"
      />
      <TextInput
        style={styles.input}
        placeholder="Principal amount"
        value={form.principal_amount || ''}
        onChangeText={(t) => setForm({ ...form, principal_amount: t })}
        keyboardType="decimal-pad"
        placeholderTextColor="#a0aec0"
      />
      <TextInput
        style={styles.input}
        placeholder="Monthly installment"
        value={form.installment_amount || ''}
        onChangeText={(t) => setForm({ ...form, installment_amount: t })}
        keyboardType="decimal-pad"
        placeholderTextColor="#a0aec0"
      />
      <TouchableOpacity
        style={[styles.submitBtn, createLoan.isPending && { opacity: 0.7 }]}
        onPress={handleAdd}
        disabled={createLoan.isPending}
      >
        <Text style={styles.submitBtnText}>{createLoan.isPending ? 'Saving…' : 'Save loan'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.employee?.name || `#${item.employee_id}`}</Text>
      <Text style={styles.cardSub}>{item.title}</Text>
      <Text style={styles.cardSub}>
        Balance {fmtRs(item.balance_remaining)} / {fmtRs(item.principal_amount)} · Installment{' '}
        {fmtRs(item.installment_amount)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ padding: normalize(15), paddingBottom: 24 }}
          refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formPanel: { backgroundColor: '#fff', padding: normalize(15), borderRadius: normalize(10), marginBottom: normalize(16) },
  formTitle: { fontSize: normalize(16), fontWeight: '700', marginBottom: normalize(6) },
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(12) },
  label: { fontSize: normalize(12), fontWeight: '600', color: '#4a5568', marginBottom: normalize(4) },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(12),
    marginBottom: normalize(10),
    borderRadius: normalize(6),
    fontSize: normalize(14),
  },
  submitBtn: { backgroundColor: '#3182ce', padding: normalize(14), borderRadius: normalize(6), alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: normalize(14),
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: normalize(15), fontWeight: '700' },
  cardSub: { fontSize: normalize(13), color: '#718096', marginTop: 4 },
});
