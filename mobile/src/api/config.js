import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Laravel `php artisan serve` (default port 8000), routes under `/api`.
 *
 * Optional `mobile/.env`:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.2:8000/api   (full base URL; wins over host/port)
 *   EXPO_PUBLIC_API_HOST=192.168.1.2
 *   EXPO_PUBLIC_API_PORT=8000
 *
 * Physical device + Expo Go: host matches Metro (your PC on Wi‑Fi).
 * Android emulator: falls back to 10.0.2.2 (host machine).
 */
function resolveDevApiHost() {
  const isLoopbackHost = (host) => host === '127.0.0.1' || host === 'localhost';

  // Your PC's LAN IP (used as a last-resort fallback for physical devices).
  // Prefer setting `EXPO_PUBLIC_API_HOST` or `EXPO_PUBLIC_API_URL` in `mobile/.env`.
  const LAN_FALLBACK_HOST = '192.168.1.10';

  const extractHostname = (value) => {
    if (!value) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    // Handles:
    // - 192.168.1.2:19000
    // - http://192.168.1.2:8081/index.bundle
    // - exp://192.168.1.2:19000
    // - exp://localhost:19000
    const withoutScheme = raw.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    const hostPort = withoutScheme.split('/')[0];
    const host = hostPort.split('@').pop()?.split(':')[0];

    return host || null;
  };

  const fromEnv = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = extractHostname(hostUri);
    if (host && !isLoopbackHost(host)) return host;
  }

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost ??
    Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const host = extractHostname(debuggerHost);
    if (host && !isLoopbackHost(host)) return host;
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const host = extractHostname(scriptURL);
    if (host && !isLoopbackHost(host)) return host;

    if (scriptURL.startsWith('http://') || scriptURL.startsWith('https://')) {
      try {
        const url = new URL(scriptURL);
        if (url.hostname && !isLoopbackHost(url.hostname)) {
          return url.hostname;
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to reach the host machine.
    // Physical Android device should use the PC's LAN IP.
    return Constants.isDevice ? LAN_FALLBACK_HOST : '10.0.2.2';
  }

  // Physical iPhone (Expo Go) cannot reach your PC via localhost.
  // Use LAN IP as the last fallback.
  return Constants.isDevice ? LAN_FALLBACK_HOST : 'localhost';
}

export const API_BASE_URL = (() => {
  const full = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (full) {
    return full.replace(/\/$/, '');
  }
  const port = process.env.EXPO_PUBLIC_API_PORT?.trim() || '8000';
  const host = resolveDevApiHost();
  return `http://${host}:${port}/api`;
})();
