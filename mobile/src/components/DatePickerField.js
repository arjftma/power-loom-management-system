import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export function formatDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(value) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [yy, mm, dd] = String(value).split('-').map(Number);
    return new Date(yy, mm - 1, dd);
  }
  return new Date();
}

export default function DatePickerField({
  value,
  onChange,
  placeholder = 'Tap to choose date',
  inputStyle,
  containerStyle,
}) {
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [iosTemp, setIosTemp] = useState(() => parseYMD(value));

  const open = () => {
    if (Platform.OS === 'android') {
      setShowAndroid(true);
    } else {
      setIosTemp(parseYMD(value));
      setShowIosModal(true);
    }
  };

  const onAndroidChange = (event, selected) => {
    setShowAndroid(false);
    if (event.type === 'set' && selected) {
      onChange(formatDateYMD(selected));
    }
  };

  const commitIos = () => {
    onChange(formatDateYMD(iosTemp));
    setShowIosModal(false);
  };

  const hasValue = Boolean(value);

  return (
    <View style={containerStyle}>
      <Pressable
        style={[styles.box, inputStyle]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text style={hasValue ? styles.text : styles.placeholder}>
          {hasValue ? value : placeholder}
        </Text>
      </Pressable>

      {showAndroid && (
        <DateTimePicker
          value={parseYMD(value)}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          maximumDate={new Date(2100, 11, 31)}
          minimumDate={new Date(1990, 0, 1)}
        />
      )}

      <Modal
        visible={showIosModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowIosModal(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowIosModal(false)}
            accessibilityLabel="Close calendar"
          />
          <View style={styles.iosSheet}>
            <View style={styles.iosHeader}>
              <Pressable onPress={() => setShowIosModal(false)} hitSlop={12}>
                <Text style={styles.link}>Cancel</Text>
              </Pressable>
              <Pressable onPress={commitIos} hitSlop={12}>
                <Text style={[styles.link, styles.done]}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={iosTemp}
              mode="date"
              display="inline"
              onChange={(_, d) => {
                if (d) setIosTemp(d);
              }}
              maximumDate={new Date(2100, 11, 31)}
              minimumDate={new Date(1990, 0, 1)}
              style={styles.iosPicker}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#2d3748',
  },
  placeholder: {
    fontSize: 14,
    color: '#a0aec0',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalBackdrop: {
    flex: 1,
  },
  iosSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  link: {
    fontSize: 16,
    color: '#3182ce',
  },
  done: {
    fontWeight: '600',
  },
  iosPicker: {
    alignSelf: 'center',
    width: '100%',
  },
});
