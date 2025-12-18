// Frontend/src/lib/api.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const TOKEN_KEY = '@loggedInUserID:key';

async function getToken() {
  try {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Make sure we always join base URL + path correctly
  const url = new URL(path, API_URL).toString();

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'omit', // change to 'include' only if you start using cookies + update CORS
  });

  const text = await res.text().catch(() => '');

  if (!res.ok) {
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = (json as any).message || (json as any).error || text;
    } catch (err) {
      // ignore JSON parse error, use raw text
    }
    const error: any = new Error(msg || `HTTP ${res.status}`);
    error.status = res.status;
    error.body = text;
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    return text;
  }
}
