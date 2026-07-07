import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePayments } from '../queries/usePayments';
import { useCustomers } from '../queries/useCustomers';
import { useSuppliers } from '../queries/useSuppliers';
import { usePaymentMutations } from '../mutations/usePaymentMutations';
import { normalize } from '../utils/responsive';
import DatePickerField, { formatDateYMD } from '../components/DatePickerField';
import PickerField from '../components/PickerField';

const TYPE_PAID = 'paid_to_supplier';
const TYPE_RECEIVED = 'received_from_customer';

const TYPE_LABELS = {
  [TYPE_PAID]: 'Paid to supplier',
  [TYPE_RECEIVED]: 'Received from customer',
};

export default function PaymentScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Payments',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isError, error, refetch } = usePayments();
  const { data: customersRaw, refetch: refetchCustomers } = useCustomers();
  const { data: suppliersRaw, refetch: refetchSuppliers } = useSuppliers();
  const [syncRefreshing, setSyncRefreshing] = useState(false);
  const onPullRefresh = useCallback(async () => {
    setSyncRefreshing(true);
    try {
      await Promise.all([refetch(), refetchCustomers(), refetchSuppliers()]);
    } finally {
      setSyncRefreshing(false);
    }
  }, [refetch, refetchCustomers, refetchSuppliers]);
  const { addMutation, deleteMutation } = usePaymentMutations();
  const [form, setForm] = useState(() => ({
    date: formatDateYMD(new Date()),
    type: TYPE_RECEIVED,
  }));
  const rows = Array.isArray(data) ? data : [];
  const customers = Array.isArray(customersRaw) ? customersRaw : [];
  const suppliers = Array.isArray(suppliersRaw) ? suppliersRaw : [];

  const setType = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      supplier_id: null,
      customer_id: null,
    }));
  };

  const handleAdd = () => {
    const payload = {
      type: form.type,
      amount: form.amount,
      date: form.date,
      remarks: form.remarks || null,
    };
    if (form.type === TYPE_PAID) {
      payload.supplier_id =
        form.supplier_id != null && form.supplier_id !== ''
          ? Number(form.supplier_id)
          : null;
      payload.customer_id = null;
    } else {
      payload.customer_id =
        form.customer_id != null && form.customer_id !== ''
          ? Number(form.customer_id)
          : null;
      payload.supplier_id = null;
    }

    addMutation.mutate(payload, {
      onSuccess: () =>
        setForm({
          date: formatDateYMD(new Date()),
          type: TYPE_RECEIVED,
        }),
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
        <Text style={styles.formTitle}>Record payment</Text>
        <Text style={styles.hint}>Choose whether money was received from a customer or paid to a supplier (proposal).</Text>

        <Text style={styles.fieldLabel}>Payment type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeChip, form.type === TYPE_RECEIVED && styles.typeChipActive]}
            onPress={() => setType(TYPE_RECEIVED)}
          >
            <Text style={[styles.typeChipText, form.type === TYPE_RECEIVED && styles.typeChipTextActive]}>
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeChip, styles.typeChipLast, form.type === TYPE_PAID && styles.typeChipActive]}
            onPress={() => setType(TYPE_PAID)}
          >
            <Text style={[styles.typeChipText, form.type === TYPE_PAID && styles.typeChipTextActive]}>Paid</Text>
          </TouchableOpacity>
        </View>

        {form.type === TYPE_RECEIVED ? (
          <>
            <Text style={styles.fieldLabel}>Customer (related party)</Text>
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
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Supplier (related party)</Text>
            <PickerField
              items={suppliers}
              valueId={form.supplier_id}
              onChange={(id) =>
                setForm((prev) => ({
                  ...prev,
                  supplier_id: id == null ? null : id,
                }))
              }
              placeholder="Tap to select supplier"
              modalTitle="Select supplier"
              inputStyle={styles.input}
              allowClear
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Amount"
          value={form.amount != null ? String(form.amount) : ''}
          onChangeText={(t) => setForm({ ...form, amount: t })}
          keyboardType="decimal-pad"
        />
        <DatePickerField
          inputStyle={styles.input}
          containerStyle={{ marginBottom: normalize(10) }}
          placeholder="Payment date"
          value={form.date || ''}
          onChange={(v) => setForm({ ...form, date: v })}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0aec0"
          placeholder="Remarks (optional)"
          value={form.remarks || ''}
          onChangeText={(t) => setForm({ ...form, remarks: t })}
        />

        <TouchableOpacity
          style={[styles.submitBtn, addMutation.isPending && { opacity: 0.7 }]}
          onPress={handleAdd}
          disabled={addMutation.isPending}
        >
          <Text style={styles.submitBtnText}>{addMutation.isPending ? 'Saving…' : 'Save payment'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Type:</Text> {TYPE_LABELS[item.type] || item.type}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Amount:</Text> {item.amount}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Date:</Text> {item.date}
        </Text>
        {item.remarks ? (
          <Text style={styles.cardText}>
            <Text style={styles.label}>Remarks:</Text> {item.remarks}
          </Text>
        ) : null}
        <Text style={styles.cardText}>
          <Text style={styles.label}>Supplier:</Text>{' '}
          {item.supplier?.name ?? (item.supplier_id != null ? `#${item.supplier_id}` : '—')}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Customer:</Text>{' '}
          {item.customer?.name ?? (item.customer_id != null ? `#${item.customer_id}` : '—')}
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
            ListEmptyComponent={<Text style={styles.emptyText}>No payment records yet.</Text>}
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
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(12) },
  fieldLabel: { fontSize: normalize(12), fontWeight: '600', color: '#4a5568', marginBottom: normalize(4) },
  typeRow: { flexDirection: 'row', marginBottom: normalize(12) },
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
