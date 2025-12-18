// src/auth/storage.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform storage for auth tokens:
 * - iOS/Android: expo-secure-store (encrypted)
 * - Web: localStorage (not encrypted; for dev only)
 */

const TOKEN_KEY_DEFAULT = "gomarket_token";

async function nativeGetItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    return null;
  }
}

async function nativeSetItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    // swallow on native; you could surface an error toast here
  }
}

async function nativeDeleteItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    // swallow on native
  }
}

function webGetItem(key: string) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function webSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch (err) {
    // swallow
  }
}

function webDeleteItem(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch (err) {
    // swallow
  }
}

export const storage = {
  async getToken(key: string = TOKEN_KEY_DEFAULT): Promise<string | null> {
    if (Platform.OS === "web") return webGetItem(key);
    return await nativeGetItem(key);
  },
  async setToken(value: string, key: string = TOKEN_KEY_DEFAULT): Promise<void> {
    if (Platform.OS === "web") return void webSetItem(key, value);
    return await nativeSetItem(key, value);
  },
  async deleteToken(key: string = TOKEN_KEY_DEFAULT): Promise<void> {
    if (Platform.OS === "web") return void webDeleteItem(key);
    return await nativeDeleteItem(key);
  },
  TOKEN_KEY_DEFAULT,
};
