import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePayroll } from '../queries/usePayroll';
import { usePayrollMutations } from '../mutations/usePayrollMutations';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { normalize } from '../utils/responsive';

function fmtRs(n) {
  return `Rs ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function LineSection({ title, items, onAdd, addPending }) {
  const [t, setT] = useState('');
  const [a, setA] = useState('');
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {(items || []).map((row) => (
        <Text key={String(row.id)} style={styles.lineItem}>
          {row.title}: {fmtRs(row.amount)}
        </Text>
      ))}
      <TextInput style={styles.input} placeholder="Title" value={t} onChangeText={setT} placeholderTextColor="#a0aec0" />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={a}
        onChangeText={setA}
        keyboardType="decimal-pad"
        placeholderTextColor="#a0aec0"
      />
      <TouchableOpacity
        style={[styles.miniBtn, addPending && { opacity: 0.7 }]}
        disabled={addPending}
        onPress={() => {
          if (!t.trim() || !a) {
            Alert.alert('Missing fields', 'Enter title and amount.');
            return;
          }
          onAdd({ title: t.trim(), amount: a }, () => {
            setT('');
            setA('');
          });
        }}
      >
        <Text style={styles.miniBtnText}>Add {title.toLowerCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SalaryRecordScreen({ route, navigation }) {
  const { payrollId, recordId, employeeName } = route.params || {};
  const { data, isLoading, isFetching, refetch } = usePayroll(payrollId);
  const { addAllowance, addBonus, addDeduction } = usePayrollMutations();

  const record = useMemo(() => {
    const list = data?.salary_records ?? data?.salaryRecords;
    if (!Array.isArray(list)) return null;
    return list.find((r) => String(r.id) === String(recordId));
  }, [data, recordId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: employeeName || 'Salary',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation, employeeName]);

  if (isLoading && !record) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text>Salary record not found.</Text>
      </View>
    );
  }

  const wrapAdd = (mut) => (body, clear) => {
    mut.mutate(
      { recordId, payrollId, ...body },
      {
        onSuccess: () => clear(),
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: normalize(15), paddingBottom: 32 }}
        refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
      >
        <View style={styles.summary}>
          <Text style={styles.netLabel}>Net salary</Text>
          <Text style={styles.netValue}>{fmtRs(record.net_salary)}</Text>
          <Text style={styles.breakdown}>
            Basic {fmtRs(record.basic_salary)} + Allowances {fmtRs(record.total_allowances)} + Bonuses{' '}
            {fmtRs(record.total_bonuses)} − Deductions {fmtRs(record.total_deductions)} − Loans{' '}
            {fmtRs(record.total_loan_installments)}
          </Text>
        </View>

        {(record.loan_installments || record.loanInstallments || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan installments (auto)</Text>
            {(record.loan_installments || record.loanInstallments || []).map((li) => (
              <Text key={String(li.id)} style={styles.lineItem}>
                {li.employee_loan?.title || li.employeeLoan?.title || 'Loan'}: {fmtRs(li.amount)}
              </Text>
            ))}
          </View>
        )}

        <LineSection
          title="Allowances"
          items={record.allowances}
          onAdd={wrapAdd(addAllowance)}
          addPending={addAllowance.isPending}
        />
        <LineSection
          title="Bonuses"
          items={record.bonuses}
          onAdd={wrapAdd(addBonus)}
          addPending={addBonus.isPending}
        />
        <LineSection
          title="Deductions"
          items={record.deductions}
          onAdd={wrapAdd(addDeduction)}
          addPending={addDeduction.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: {
    backgroundColor: '#fff',
    padding: normalize(16),
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  netLabel: { fontSize: normalize(12), color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  netValue: { fontSize: normalize(26), fontWeight: '800', color: '#2b6cb0', marginVertical: normalize(6) },
  breakdown: { fontSize: normalize(12), color: '#718096', lineHeight: normalize(18) },
  section: {
    backgroundColor: '#fff',
    padding: normalize(14),
    borderRadius: normalize(10),
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: normalize(15), fontWeight: '700', marginBottom: normalize(8), color: '#2d3748' },
  lineItem: { fontSize: normalize(13), color: '#4a5568', marginBottom: normalize(4) },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(10),
    marginBottom: normalize(8),
    borderRadius: normalize(6),
    fontSize: normalize(14),
  },
  miniBtn: { backgroundColor: '#3182ce', padding: normalize(10), borderRadius: normalize(6), alignItems: 'center' },
  miniBtnText: { color: '#fff', fontWeight: '600', fontSize: normalize(13) },
});
