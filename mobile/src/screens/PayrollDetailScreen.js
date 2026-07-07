import React from 'react';
import {
  View,
  Text,
  FlatList,
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

export default function PayrollDetailScreen({ route, navigation }) {
  const payrollId = route.params?.payrollId;
  const { data, isLoading, isFetching, refetch } = usePayroll(payrollId);
  const { generatePayroll, recalculatePayroll } = usePayrollMutations();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: data?.title || 'Payroll detail',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation, data?.title]);

  const records = Array.isArray(data?.salary_records)
    ? data.salary_records
    : Array.isArray(data?.salaryRecords)
      ? data.salaryRecords
      : [];

  const onGenerate = () => {
    Alert.alert(
      'Generate salaries?',
      'Creates a salary row for each employee, applies loan installments, and calculates net pay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () =>
            generatePayroll.mutate(payrollId, {
              onError: (e) => Alert.alert('Error', e.message),
            }),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SalaryRecord', {
          payrollId,
          recordId: item.id,
          employeeName: item.employee?.name || `Employee #${item.employee_id}`,
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.employee?.name || `Employee #${item.employee_id}`}</Text>
        <Text style={styles.line}>
          Basic {fmtRs(item.basic_salary)} + allow {fmtRs(item.total_allowances)} + bonus{' '}
          {fmtRs(item.total_bonuses)}
        </Text>
        <Text style={styles.line}>
          − deduct {fmtRs(item.total_deductions)} − loans {fmtRs(item.total_loan_installments)}
        </Text>
      </View>
      <Text style={styles.net}>{fmtRs(item.net_salary)}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary, generatePayroll.isPending && { opacity: 0.7 }]}
        onPress={onGenerate}
        disabled={generatePayroll.isPending}
      >
        <Text style={styles.btnText}>{generatePayroll.isPending ? 'Working…' : 'Generate / refresh salaries'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnSecondary, recalculatePayroll.isPending && { opacity: 0.7 }]}
        onPress={() =>
          recalculatePayroll.mutate(payrollId, { onError: (e) => Alert.alert('Error', e.message) })
        }
        disabled={recalculatePayroll.isPending}
      >
        <Text style={styles.btnTextSecondary}>Recalculate all</Text>
      </TouchableOpacity>
      <Text style={styles.formula}>
        Net = basic + allowances + bonuses − deductions − loan installments
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }} edges={['bottom']}>
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ padding: normalize(15), paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No salary rows yet. Tap “Generate / refresh salaries”.</Text>
        }
        refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actions: { marginBottom: normalize(16) },
  btn: { padding: normalize(14), borderRadius: normalize(8), alignItems: 'center', marginBottom: normalize(10) },
  btnPrimary: { backgroundColor: '#3182ce' },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3182ce' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#3182ce', fontWeight: '700' },
  formula: { fontSize: normalize(12), color: '#718096', textAlign: 'center', marginTop: normalize(4) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: normalize(14),
    borderRadius: normalize(10),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  name: { fontSize: normalize(16), fontWeight: '700', color: '#1a202c' },
  line: { fontSize: normalize(11), color: '#718096', marginTop: 4 },
  net: { fontSize: normalize(16), fontWeight: '800', color: '#2b6cb0' },
  empty: { textAlign: 'center', color: '#a0aec0', marginTop: 16 },
});
