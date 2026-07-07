import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';

/**
 * Tap-to-open list picker (proposal: customer / supplier selection instead of raw IDs).
 */
export default function PickerField({
  items = [],
  valueId,
  onChange,
  placeholder,
  inputStyle,
  modalTitle,
  labelKey = 'name',
  secondaryKey,
  allowClear = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((x) => String(x.id) === String(valueId));
  const primary = selected ? selected[labelKey] : null;
  const secondary = selected && secondaryKey ? selected[secondaryKey] : null;
  const label =
    primary && secondary ? `${primary} (${secondary})` : primary;

  return (
    <>
      <TouchableOpacity
        style={inputStyle}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text style={label ? styles.valueText : styles.placeholderText}>
          {label || placeholder}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{modalTitle || placeholder}</Text>
            {allowClear && (
              <TouchableOpacity
                style={styles.clearRow}
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Text style={styles.clearText}>Clear selection</Text>
              </TouchableOpacity>
            )}
            <FlatList
              data={items}
              keyExtractor={(it) => String(it.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.rowText}>{item[labelKey]}</Text>
                  {secondaryKey && item[secondaryKey] ? (
                    <Text style={styles.rowSub}>{String(item[secondaryKey])}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No records yet. Add some in the relevant screen.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  valueText: { fontSize: 14, color: '#2d3748' },
  placeholderText: { fontSize: 14, color: '#a0aec0' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    color: '#2d3748',
  },
  clearRow: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  clearText: { color: '#3182ce', fontWeight: '600', fontSize: 15 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f4f8',
  },
  rowText: { fontSize: 15, color: '#2d3748', fontWeight: '500' },
  rowSub: { fontSize: 13, color: '#718096', marginTop: 4 },
  empty: { padding: 24, textAlign: 'center', color: '#a0aec0' },
});
