import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@loom_saved_login_email';

/** Remember sign-in email only (not password) so it stays in sync after profile updates. */
export async function getSavedLoginEmail() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v && v.trim() ? v.trim() : '';
  } catch {
    return '';
  }
}

export async function setSavedLoginEmail(email) {
  const e = email && String(email).trim();
  if (e) {
    await AsyncStorage.setItem(KEY, e);
  }
}
