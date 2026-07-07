import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthToken } from './authToken';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function summarizePayload(data, maxLen = 500) {
  try {
    const s = typeof data === 'string' ? data : JSON.stringify(data);
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  } catch {
    return String(data);
  }
}

/** Map Laravel / axios errors into a single user-facing message */
export function formatApiError(error) {
  if (error.response) {
    const { data, status } = error.response;
    const errors = data?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const val = errors[firstKey];
        const firstMsg = Array.isArray(val) ? val[0] : String(val);
        return `${firstKey}: ${firstMsg}`;
      }
    }
    const msg = data?.message;
    if (typeof msg === 'string' && msg.trim()) {
      const m = msg.match(/Data truncated for column ['`]([^'`]+)['`]/i);
      if (m) {
        return `Invalid value for “${m[1]}”: use only allowed options (e.g. employee role: weaver or helper; payment type must match Received/Paid).`;
      }
      if (msg.includes('SQLSTATE') && msg.includes('Integrity constraint')) {
        return 'This record conflicts with another (foreign key). Check customer/supplier IDs exist.';
      }
      if (msg.includes('SQLSTATE') && msg.length > 200) {
        return `${msg.slice(0, 200)}…`;
      }
      return msg;
    }
    return error.message || `Request failed (${status})`;
  }
  if (error.request) {
    return 'No response from server';
  }
  return error.message || 'Unknown error';
}

if (__DEV__) {
  client.interceptors.request.use((config) => {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    const body =
      config.data != null ? summarizePayload(config.data, 300) : undefined;
    console.log(
      `[API] → ${(config.method || 'get').toUpperCase()} ${fullUrl}`,
      body ?? ''
    );
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      console.log(
        `[API] ← ${response.status} ${response.config?.baseURL || ''}${response.config?.url || ''}`,
        summarizePayload(response.data, 400)
      );
      return response;
    },
    (error) => {
      const st = error.response?.status;
      const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      const body = error.response ? summarizePayload(error.response.data, 400) : '';
      const netHint = error.response
        ? ''
        : ` | ${[error.code, error.message].filter(Boolean).join(' ') || 'no response from server'}`;
      console.warn(`[API] ✗ ${st ?? '?'} ${url}`, body || netHint.trim());
      return Promise.reject(error);
    }
  );
}

client.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customApiCall = async (method, url, data = null, params = null) => {
  try {
    const response = await client({ method, url, data, params });
    return response.data;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
};

export default client;
