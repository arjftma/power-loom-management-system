import * as SecureStore from 'expo-secure-store';

/** In-session copy of the bearer token (avoids iOS race: GET right after login before SecureStore read sees the new value). */
let memoryToken = null;

export function setAuthToken(token) {
  memoryToken = token && String(token).trim() ? String(token) : null;
}

export function clearAuthToken() {
  memoryToken = null;
}

/** Token for outgoing API calls: memory first, then SecureStore (cold start). */
export async function getAuthToken() {
  if (memoryToken) return memoryToken;
  return SecureStore.getItemAsync('token');
}
