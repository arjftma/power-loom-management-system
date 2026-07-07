import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduction } from '../queries/useProduction';
import { useProductionMutations } from '../mutations/useProductionMutations';
import { normalize } from '../utils/responsive';
import DatePickerField, { formatDateYMD } from '../components/DatePickerField';

export default function ProductionScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Fabric production',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isFetching, isError, error, refetch } = useProduction();
  const { addMutation, deleteMutation } = useProductionMutations();
  const [form, setForm] = useState(() => ({ date: formatDateYMD(new Date()) }));
  const rows = Array.isArray(data) ? data : [];

  const handleAdd = () => {
    addMutation.mutate(form, {
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
        <Text style={styles.formTitle}>Record production batch</Text>
        <Text style={styles.hint}>
          One batch = fabric taken down from one loom on a given day (typical batch ~200–250 m). Stock is computed as total production minus total dispatch.
        </Text>
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Loom number" value={form.loom_number || ''} onChangeText={t => setForm({...form, loom_number: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Fabric type" value={form.fabric_type || ''} onChangeText={t => setForm({...form, fabric_type: t})} />
        <DatePickerField
          inputStyle={styles.input}
          containerStyle={{ marginBottom: normalize(10) }}
          placeholder="Production date"
          value={form.date || ''}
          onChange={(v) => setForm({ ...form, date: v })}
        />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Quality grade (optional)" value={form.quality_grade || ''} onChangeText={t => setForm({...form, quality_grade: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Unit (default: m)" value={form.unit || ''} onChangeText={t => setForm({...form, unit: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Remarks (optional)" value={form.remarks || ''} onChangeText={t => setForm({...form, remarks: t})} />
        <TextInput style={styles.input} placeholderTextColor="#a0aec0" placeholder="Meters produced (this batch)" value={form.meters_produced || ''} onChangeText={t => setForm({...form, meters_produced: t, quantity_produced: t})} keyboardType="decimal-pad" />
        <TouchableOpacity style={[styles.submitBtn, addMutation.isPending && {opacity: 0.7}]} onPress={handleAdd} disabled={addMutation.isPending}>
          <Text style={styles.submitBtnText}>{addMutation.isPending ? 'Saving…' : 'Save batch'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardData}>
        <Text style={styles.cardText}><Text style={styles.label}>Loom:</Text> {item.loom_number}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Fabric:</Text> {item.fabric_type}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Date:</Text> {item.date}</Text>
        <Text style={styles.cardText}><Text style={styles.label}>Meters:</Text> {item.meters_produced}</Text>
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