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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePayrolls } from '../queries/usePayroll';
import { usePayrollMutations } from '../mutations/usePayrollMutations';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { normalize } from '../utils/responsive';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PayrollScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Payroll',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('EmployeeLoans')} style={{ paddingHorizontal: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Loans</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  const { data, isLoading, isFetching, isError, error, refetch } = usePayrolls();
  const { createPayroll, deletePayroll } = usePayrollMutations();
  const rows = Array.isArray(data) ? data : [];

  const handleCreate = () => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (!y || m < 1 || m > 12) {
      Alert.alert('Payroll', 'Enter a valid year and month (1–12).');
      return;
    }
    createPayroll.mutate(
      { year: y, month: m },
      {
        onSuccess: (p) => navigation.navigate('PayrollDetail', { payrollId: p.id }),
        onError: (e) => Alert.alert('Could not create', e.message),
      }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PayrollDetail', { payrollId: item.id })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title || `${item.year}-${String(item.month).padStart(2, '0')}`}</Text>
        <Text style={styles.cardSub}>
          {MONTHS[item.month - 1]} {item.year} · {item.status}
          {item.generated_at ? ' · generated' : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Delete payroll?', 'This removes all salary records for this month.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deletePayroll.mutate(item.id, { onError: (e) => Alert.alert('Error', e.message) }),
            },
          ])
        }
        style={styles.delBtn}
      >
        <Text style={styles.delText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const listHeader = (
    <View style={styles.formPanel}>
      <Text style={styles.formTitle}>New payroll month</Text>
      <Text style={styles.hint}>
        Net salary = basic + allowances + bonuses − deductions − loan installments (auto-calculated).
      </Text>
      <TextInput style={styles.input} placeholder="Year" value={year} onChangeText={setYear} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Month (1-12)" value={month} onChangeText={setMonth} keyboardType="number-pad" />
      <TouchableOpacity
        style={[styles.submitBtn, createPayroll.isPending && { opacity: 0.7 }]}
        onPress={handleCreate}
        disabled={createPayroll.isPending}
      >
        <Text style={styles.submitBtnText}>{createPayroll.isPending ? 'Creating…' : 'Create payroll'}</Text>
      </TouchableOpacity>
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
      {isError && <Text style={styles.errBanner}>{error?.message}</Text>}
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ padding: normalize(15), paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>No payroll runs yet.</Text>}
        refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formPanel: {
    backgroundColor: '#fff',
    padding: normalize(15),
    borderRadius: normalize(10),
    marginBottom: normalize(16),
    elevation: 2,
  },
  formTitle: { fontSize: normalize(16), fontWeight: '700', color: '#2d3748', marginBottom: normalize(6) },
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(12) },
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: normalize(14),
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: normalize(16), fontWeight: '700', color: '#1a202c' },
  cardSub: { fontSize: normalize(13), color: '#718096', marginTop: 4 },
  delBtn: { padding: normalize(8) },
  delText: { color: '#dc2626', fontWeight: '600', fontSize: normalize(12) },
  empty: { textAlign: 'center', color: '#a0aec0', marginTop: 20 },
  errBanner: { color: '#c53030', padding: 12, textAlign: 'center' },
});
