// Frontend/src/auth/callback.tsx
// Expo Router auth callback for Supabase magic link / OAuth.
// - Reads ?code= and exchanges it for a session
// - Handles optional ?next=/path redirection
// - Shows a tiny loading state and friendly errors
// - Works on web + native (no window assumptions during render)

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, hasSupabaseClient } from '../lib/supabase';
import { Platform, View, ActivityIndicator, Text } from 'react-native';

type Query = { code?: string; next?: string; error_description?: string };

export default function AuthCallback() {
  const router = useRouter();
  const { code, next, error_description } = useLocalSearchParams<Query>();
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Decide where to go after login
  const destination = useMemo(() => {
    if (typeof next === 'string' && next.startsWith('/')) return next;
    return '/';
  }, [next]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('working');

      if (!hasSupabaseClient || !supabase) {
        setStatus('error');
        setMessage('Supabase auth is not configured.');
        setTimeout(() => router.replace('/?auth=disabled'), 800);
        return;
      }

      // If Supabase sent back an error in the URL, surface it
      if (error_description && typeof error_description === 'string') {
        setStatus('error');
        setMessage(decodeURIComponent(error_description));
        // Bounce to home in a moment
        setTimeout(() => router.replace('/?auth=error'), 1200);
        return;
      }

      // Validate code param
      if (!code || Array.isArray(code)) {
        setStatus('error');
        setMessage('Missing or invalid auth code.');
        setTimeout(() => router.replace('/?auth=missing_code'), 800);
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            setStatus('error');
            setMessage(error.message || 'Auth exchange failed.');
            // Redirect away so the page isn’t stuck
            setTimeout(() => router.replace('/?auth=error'), 800);
          }
          return;
        }

        if (!cancelled) {
          setStatus('done');
          // Short pause to avoid a flash, then go to the intended page
          setTimeout(() => router.replace(destination as any), 200);
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus('error');
          setMessage(e?.message ?? 'Unexpected error during sign-in.');
          setTimeout(() => router.replace('/?auth=exception'), 800);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, error_description, destination, router]);

  // Minimal UI while we work (shows on web & native)
  if (status === 'working' || status === 'idle') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ActivityIndicator size={Platform.OS === 'web' ? undefined : 'large'} />
        <Text style={{ marginTop: 12 }}>Signing you in…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Login error</Text>
        {message ? <Text style={{ textAlign: 'center' }}>{message}</Text> : null}
        <Text style={{ marginTop: 16 }}>Redirecting…</Text>
      </View>
    );
  }

  // status === 'done' → we already redirected; render nothing
  return null;
}
