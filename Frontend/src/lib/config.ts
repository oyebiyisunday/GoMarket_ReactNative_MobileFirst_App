// Frontend/src/lib/config.ts
// Make Supabase configuration optional at build time so web export doesn't fail
// when only backend API auth is in use.

import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// ---- API base URL ----------------------------------------------------------

// In dev we talk to localhost / emulator.
// In production web we default to the deployed Railway API, unless
// EXPO_PUBLIC_API_URL / EXPO_PUBLIC_API_BASE are explicitly set.

const DEFAULT_DEV_PORT = 4000;
const DEFAULT_PROD_API_WEB = 'https://gomarketapp-production.up.railway.app';

function resolveExpoLanHost(): string | null {
  const manifestHost =
    (Constants as any)?.manifest?.debuggerHost?.split?.(':')?.[0] ??
    Constants.expoConfig?.hostUri?.split?.(':')?.[0] ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri?.split?.(':')?.[0];
  if (manifestHost && !['localhost', '127.0.0.1'].includes(manifestHost)) {
    return manifestHost;
  }
  const scriptUrl = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptUrl === 'string') {
    try {
      const parsed = new URL(scriptUrl);
      const host = parsed.hostname;
      if (host && !['localhost', '127.0.0.1'].includes(host)) {
        return host;
      }
    } catch (err) {
      // ignore parsing errors
    }
  }
  return null;
}

function inferDefaultApi(): string {
  // On web in production, point at Railway by default
  if (NODE_ENV === 'production' && Platform.OS === 'web') {
    return DEFAULT_PROD_API_WEB;
  }

  // Local dev defaults
  const port = DEFAULT_DEV_PORT;
  if (Platform.OS !== 'web') {
    const lanHost = resolveExpoLanHost();
    if (lanHost) return `http://${lanHost}:${port}`;
    if (Platform.OS === 'android') return `http://10.0.2.2:${port}`;
  }
  return `http://localhost:${port}`;
}

// Ensure no trailing slash so `${API_URL}/api/...` is clean
function normalizeBaseUrl(url: string): string {
  if (!url) return url;
  return url.replace(/\/+$/, '');
}

// On Android emulator, swap localhost -> 10.0.2.2 so native can reach host.
function adaptLocalhostForAndroid(url: string): string {
  if (!url || Platform.OS !== 'android') return url;
  try {
    const parsed = new URL(url);
    if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      parsed.hostname = '10.0.2.2';
      return normalizeBaseUrl(parsed.toString());
    }
  } catch (err) {
    // If parse fails, just return original
  }
  return url;
}

function isLocalhostish(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '0.0.0.0', '10.0.2.2'].includes(
      parsed.hostname
    );
  } catch (err) {
    return false;
  }
}

function enforceProdWebApi(url: string): string {
  if (!url) return url;
  if (NODE_ENV === 'production' && Platform.OS === 'web' && isLocalhostish(url)) {
    return DEFAULT_PROD_API_WEB;
  }
  return url;
}

const resolvedApiUrl = adaptLocalhostForAndroid(
  process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE ||
    inferDefaultApi()
);

export const API_URL = normalizeBaseUrl(enforceProdWebApi(resolvedApiUrl));

function ensureApiBase(url: string): string {
  if (!url) return '';
  if (/\/api(?:\/)?$/i.test(url)) return normalizeBaseUrl(url);
  return `${url}/api`;
}

export const API_BASE = ensureApiBase(API_URL);

if (!SUPABASE_URL || !SUPABASE_ANON) {
  if (typeof console !== 'undefined') {
    console.warn(
      '[config] Supabase env not set (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }
}

if (typeof console !== 'undefined') {
  console.log('[config] API_URL:', API_URL);
}
