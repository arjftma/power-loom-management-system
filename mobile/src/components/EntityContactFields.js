import React from 'react';
import { TextInput, Text, StyleSheet } from 'react-native';
import { normalize } from '../utils/responsive';

/** Shared CNIC / phone / address / email fields for entity forms. */
export default function EntityContactFields({
  form,
  setForm,
  inputStyle,
  cnicKey = 'cnic',
  cnicLabel = 'CNIC',
  phoneKey = 'phone',
  phoneLabel = 'Phone number',
}) {
  const style = inputStyle || styles.input;
  return (
    <>
      <Text style={styles.label}>{cnicLabel}</Text>
      <TextInput
        style={style}
        placeholder="12345-1234567-1"
        placeholderTextColor="#a0aec0"
        value={form[cnicKey] || ''}
        onChangeText={(t) => setForm({ ...form, [cnicKey]: t })}
      />
      <Text style={styles.label}>{phoneLabel}</Text>
      <TextInput
        style={style}
        placeholder="03xx-xxxxxxx"
        placeholderTextColor="#a0aec0"
        value={form[phoneKey] || ''}
        onChangeText={(t) => setForm({ ...form, [phoneKey]: t })}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={style}
        placeholder="Street, city"
        placeholderTextColor="#a0aec0"
        value={form.address || ''}
        onChangeText={(t) => setForm({ ...form, address: t })}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={style}
        placeholder="email@example.com"
        placeholderTextColor="#a0aec0"
        value={form.email || ''}
        onChangeText={(t) => setForm({ ...form, email: t })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: normalize(12), fontWeight: '600', color: '#4a5568', marginBottom: normalize(4) },
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
});
