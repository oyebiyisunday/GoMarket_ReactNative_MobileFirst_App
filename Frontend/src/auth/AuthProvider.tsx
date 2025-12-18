// Frontend/src/auth/AuthProvider.tsx
// Cross-platform Auth context (web/iOS/Android) using your Redux thunks
// + Supabase helper exports for magic link & OAuth that set the redirect.
//
// What this provides:
// - Auth context (user, token, loading, login, signup, logout)
// - Persists token (AsyncStorage on native, localStorage on web)
// - Periodic session re-check & on app resume
// - Normalizes user object (name, userType)
// - signInWithEmail() and signInWithProvider() that send users to /auth/callback
//
// Requirements elsewhere:
// - Frontend/src/lib/supabase.ts must exist and read EXPO_PUBLIC_* envs.
// - Frontend/src/auth/callback.tsx should call supabase.auth.exchangeCodeForSession(code).

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, logoutUser, checkAuthStatus } from "../store/authSlice";
import { apiSignup } from "./api";
import { hasSupabaseClient, requireSupabaseClient } from "../lib/supabase";

// ---------- Config ----------
const TOKEN_KEY = "@loggedInUserID:key";
const USER_ID_KEY = "@loggedInUserID:id";
const SESSION_CHECK_INTERVAL = 15 * 60 * 1000; // 15 min

// Compute a redirect origin that works in dev & prod.
// On web, window.location.origin includes the correct localhost:PORT.
// On native, we fall back to an optional EXPO_PUBLIC_SITE_URL (set it if you do native deep links later).
function getRedirectOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  // Optional native fallback (set this if you add universal links later)
  return process.env.EXPO_PUBLIC_SITE_URL || "";
}

// ---------- Types ----------
type UserLike = {
  id?: string | number;
  email?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  userType?: "individual" | "entity" | string;
  [k: string]: any;
};

type SignupArgs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType?: "individual" | "entity";
  phone: string;
  idNumber?: string;
};

type SignupResult =
  | { status: "approved" }
  | { status: "pending"; applicationId?: string };

type AuthContextType = {
  user: UserLike | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (args: SignupArgs) => Promise<SignupResult>;
  logout: () => Promise<void>;
};

// ---------- Small storage shim (web + native) ----------
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      try {
        const v = window.localStorage.getItem(key);
        return v === null ? null : v;
      } catch (err) {
        return null;
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      try {
        window.localStorage.setItem(key, value);
      } catch (err) {}
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {}
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {}
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {}
  },
};

// ---------- Context ----------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isLoading, isLoggedIn } = useAppSelector((s) => s.auth);
  const [token, setToken] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restore session on start
  useEffect(() => {
    dispatch(checkAuthStatus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local token in sync with Redux auth state
  useEffect(() => {
    (async () => {
      const t = await storage.getItem(TOKEN_KEY);
      setToken(t);
    })();
  }, [isLoggedIn]);

  // Periodic session re-check + on app resume
  useEffect(() => {
    const startInterval = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        dispatch(checkAuthStatus());
      }, SESSION_CHECK_INTERVAL);
    };
    const clearIntervalIfAny = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startInterval();

    const onChange = (state: AppStateStatus) => {
      if (state === "active") {
        dispatch(checkAuthStatus());
        startInterval();
      } else {
        clearIntervalIfAny();
      }
    };

    if (Platform.OS !== "web") {
      const sub = AppState.addEventListener("change", onChange);
      return () => {
        sub.remove();
        clearIntervalIfAny();
      };
    }

    return () => clearIntervalIfAny();
  }, [dispatch]);

  // Normalize user shape for UI
  const mappedUser: UserLike | null = useMemo(() => {
    if (!user) return null;
    const name =
      (user as any).name ||
      (user as any).fullName ||
      `${(user as any).firstName || ""} ${(user as any).lastName || ""}`.trim() ||
      (user as any).email;
    const userType = (user as any).userType || "individual";
    return { ...user, name, userType };
  }, [user]);

  // ---------- Actions (your backend thunks) ----------
  const login = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password })).unwrap();
    // Immediately sync token to state after login
    const t = await storage.getItem(TOKEN_KEY);
    setToken(t);
  };

  const signup = async ({
    firstName,
    lastName,
    email,
    password,
    userType = "individual",
    phone,
    idNumber,
  }: SignupArgs): Promise<SignupResult> => {
    const fullName = `${firstName} ${lastName}`.trim();
    const result = await apiSignup({ email, password, firstName, lastName, name: fullName, userType, phone, idNumber });

    // Signups must be confirmed before use; ignore any tokens returned and keep users logged out.
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_ID_KEY);

    const statusFromApi = (result as any)?.status;
    const applicationId = (result as any)?.applicationId;

    if (statusFromApi === "approved") {
      return { status: "approved" };
    }

    return { status: "pending", applicationId };
  };

  const logout = async () => {
    await dispatch(logoutUser());
    setToken(null);
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_ID_KEY);
  };

  const value = useMemo(
    () => ({ user: mappedUser, token, loading: isLoading, login, signup, logout }),
    [mappedUser, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth anywhere
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

// ---------- Supabase helpers (magic link / OAuth) ----------
// Use these if you want Supabase-based auth flows in addition to your backend thunks.
// They automatically set redirect to /auth/callback using the correct origin (local or prod).

export async function signInWithEmail(email: string) {
  if (!hasSupabaseClient) {
    return { error: new Error("Supabase auth is not configured for this build.") };
  }
  const supabase = requireSupabaseClient();
  const origin = getRedirectOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });
  return { error };
}

export async function signInWithProvider(provider: "google" | "github") {
  if (!hasSupabaseClient) {
    return {
      data: null,
      error: new Error("Supabase auth is not configured for this build."),
    };
  }
  const supabase = requireSupabaseClient();
  const origin = getRedirectOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });
  return { data, error };
}
