import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomers } from '../queries/useCustomers';
import { useCustomerMutations } from '../mutations/useCustomerMutations';
import { normalize } from '../utils/responsive';
import EntityContactFields from '../components/EntityContactFields';

export default function CustomerScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Customers',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isFetching, isError, error, refetch } = useCustomers();
  const { addMutation, deleteMutation } = useCustomerMutations();
  const [form, setForm] = useState({});
  const rows = Array.isArray(data) ? data : [];

  const handleAdd = () => {
    addMutation.mutate(form, {
      onSuccess: () => setForm({}),
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
        <Text style={styles.formTitle}>Add customer</Text>
        <Text style={styles.hint}>Customer name, company, CNIC/NTN, type, and credit limit (ERD fields).</Text>
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Customer name" value={form.customer_name || form.name || ''} onChangeText={t => setForm({...form, customer_name: t, name: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Company name (optional)" value={form.company_name || ''} onChangeText={t => setForm({...form, company_name: t})} />
        <EntityContactFields form={form} setForm={setForm} inputStyle={styles.input} cnicKey="cnic_or_ntn" cnicLabel="CNIC / NTN" />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Customer type (retail / wholesale)" value={form.customer_type || ''} onChangeText={t => setForm({...form, customer_type: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Credit limit (Rs)" value={form.credit_limit != null ? String(form.credit_limit) : ''} onChangeText={t => setForm({...form, credit_limit: t})} keyboardType="decimal-pad" />
        <TouchableOpacity style={[styles.submitBtn, addMutation.isPending && {opacity: 0.7}]} onPress={handleAdd} disabled={addMutation.isPending}>
          <Text style={styles.submitBtnText}>{addMutation.isPending ? "Saving..." : "Add Record"}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}><Text style={styles.label}>Name:</Text> {item.name}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>CNIC:</Text> {item.cnic ?? '—'}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Phone:</Text> {item.phone ?? item.contact ?? '—'}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Email:</Text> {item.email ?? '—'}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Address:</Text> {item.address ?? '—'}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f0f4f8'}}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: normalize(24) }}>
            <ActivityIndicator size="large" color="#3182ce" />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={item => item.id.toString()}
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
  formPanel: { backgroundColor: '#fff', padding: normalize(15), borderRadius: normalize(10), marginBottom: normalize(20), shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  formTitle: { fontSize: normalize(16), fontWeight: 'bold', color: '#2d3748', marginBottom: normalize(6) },
  hint: { fontSize: normalize(12), color: '#718096', marginBottom: normalize(12) },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: normalize(12), marginBottom: normalize(10), borderRadius: normalize(6), fontSize: normalize(14), color: '#2d3748' },
  submitBtn: { backgroundColor: '#3182ce', padding: normalize(14), borderRadius: normalize(6), alignItems: 'center', marginTop: normalize(5) },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: normalize(16) },
  card: { backgroundColor: '#fff', padding: normalize(15), borderRadius: normalize(8), marginBottom: normalize(10), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardData: { flex: 1, paddingRight: normalize(10) },
  cardText: { fontSize: normalize(14), color: '#4a5568', marginBottom: normalize(4) },
  label: { fontWeight: 'bold', color: '#2d3748' },
  deleteBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', paddingVertical: normalize(8), paddingHorizontal: normalize(12), borderRadius: normalize(6) },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: normalize(12) },
  emptyText: { textAlign: 'center', color: '#a0aec0', fontSize: normalize(14), marginTop: normalize(20) },
  errorBanner: { backgroundColor: '#fff5f5', padding: normalize(12), borderRadius: normalize(8), marginBottom: normalize(12), borderWidth: 1, borderColor: '#feb2b2' },
  errorBannerText: { color: '#c53030', fontSize: normalize(14), marginBottom: normalize(8) },
  errorRetry: { alignSelf: 'flex-start' },
  errorRetryText: { color: '#3182ce', fontWeight: '600', fontSize: normalize(14) },
});