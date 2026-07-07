import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from '../queries/useDispatch';
import { useCustomers } from '../queries/useCustomers';
import { useDashboard } from '../queries/useDashboard';
import { useDispatchMutations } from '../mutations/useDispatchMutations';
import { normalize } from '../utils/responsive';
import DatePickerField, { formatDateYMD } from '../components/DatePickerField';
import PickerField from '../components/PickerField';

function parseMetersInput(raw) {
  const n = parseFloat(String(raw ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

export default function DispatchScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Fabric dispatch',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isError, error, refetch } = useDispatch();
  const { data: customersRaw, refetch: refetchCustomers } = useCustomers();
  const { data: dashData, refetch: refetchDashboard } = useDashboard();
  const stockMeters = Math.max(0, Number(dashData?.current_stock ?? 0));
  const [syncRefreshing, setSyncRefreshing] = useState(false);
  const onPullRefresh = useCallback(async () => {
    setSyncRefreshing(true);
    try {
      await Promise.all([refetch(), refetchCustomers(), refetchDashboard()]);
    } finally {
      setSyncRefreshing(false);
    }
  }, [refetch, refetchCustomers, refetchDashboard]);
  const { addMutation, deleteMutation } = useDispatchMutations();
  const [form, setForm] = useState(() => ({ date: formatDateYMD(new Date()) }));
  const rows = Array.isArray(data) ? data : [];
  const customers = Array.isArray(customersRaw) ? customersRaw : [];

  const handleAdd = () => {
    const qty = parseMetersInput(form.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert('Quantity', 'Enter a valid quantity in meters (greater than zero).');
      return;
    }
    if (dashData != null && qty > stockMeters + 1e-6) {
      Alert.alert(
        'Not enough stock',
        `Available fabric in hand is ${stockMeters.toFixed(2)} m. You cannot dispatch ${qty.toFixed(2)} m until more is produced.`,
      );
      return;
    }
    const payload = {
      fabric_type: form.fabric_type,
      quantity: form.quantity,
      date: form.date,
      ...(form.customer_id != null && form.customer_id !== ''
        ? { customer_id: Number(form.customer_id) }
        : { customer_id: null }),
    };
    addMutation.mutate(payload, {
      onSuccess: () => setForm({ date: formatDateYMD(new Date()) }),
      onError: (e) => Alert.alert('Could not save', e.message),
    });
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
        <Text style={styles.formTitle}>Record fabric dispatch</Text>
        <Text style={styles.hint}>
          Select customer, fabric type, dispatch date, and meters sent. Stock is total production minus total dispatch.
        </Text>
        <Text style={[styles.stockLine, stockMeters <= 0 && styles.stockLineWarn]}>
          {dashData == null
            ? 'Loading available stock…'
            : `Available stock: ${stockMeters.toFixed(2)} m (cannot dispatch more than this).`}
        </Text>
        <Text style={styles.fieldLabel}>Customer</Text>
        <PickerField
          items={customers}
          valueId={form.customer_id}
          onChange={(id) =>
            setForm((prev) => ({
              ...prev,
              customer_id: id == null ? null : id,
            }))
          }
          placeholder="Tap to select customer"
          modalTitle="Select customer"
          inputStyle={styles.input}
          allowClear
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Fabric type"
          value={form.fabric_type || ''}
          onChangeText={(t) => setForm({ ...form, fabric_type: t })}
        />
        <DatePickerField
          inputStyle={styles.input}
          containerStyle={{ marginBottom: normalize(10) }}
          placeholder="Dispatch date"
          value={form.date || ''}
          onChange={(v) => setForm({ ...form, date: v })}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Quantity (meters dispatched)"
          value={form.quantity || ''}
          onChangeText={(t) => setForm({ ...form, quantity: t, quantity_dispatched: t })}
          keyboardType="decimal-pad"
        />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Vehicle number" value={form.vehicle_no || ''} onChangeText={t => setForm({...form, vehicle_no: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Dispatch challan no." value={form.dispatch_challan_no || ''} onChangeText={t => setForm({...form, dispatch_challan_no: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Received by" value={form.received_by || ''} onChangeText={t => setForm({...form, received_by: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Remarks (optional)" value={form.remarks || ''} onChangeText={t => setForm({...form, remarks: t})} />
        <TouchableOpacity
          style={[styles.submitBtn, addMutation.isPending && { opacity: 0.7 }]}
          onPress={handleAdd}
          disabled={addMutation.isPending}
        >
          <Text style={styles.submitBtnText}>
            {addMutation.isPending ? 'Saving…' : 'Save dispatch'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Customer:</Text>{' '}
          {item.customer?.name ?? (item.customer_id != null ? `#${item.customer_id}` : '—')}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Fabric:</Text> {item.fabric_type}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Date:</Text> {item.date}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Quantity (m):</Text> {item.quantity}
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
            ListEmptyComponent={<Text style={styles.emptyText}>No dispatch records yet.</Text>}
            keyboardShouldPersistTaps="handled"
            refreshControl={pullRefreshControl(syncRefreshing, onPullRefresh)}
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
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(8) },
  stockLine: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: '#2b6cb0',
    marginBottom: normalize(12),
    lineHeight: normalize(18),
  },
  stockLineWarn: { color: '#c05621' },
  fieldLabel: { fontSize: normalize(12), fontWeight: '600', color: '#4a5568', marginBottom: normalize(4) },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: normalize(12),
    marginBottom: normalize(10),
    borderRadius: normalize(6),
    fontSize: normalize(14),
    color: '#2d3748',
    justifyContent: 'center',
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
