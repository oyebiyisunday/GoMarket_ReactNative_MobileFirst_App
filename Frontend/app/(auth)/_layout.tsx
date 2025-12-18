import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/auth/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { HomeHeaderButton } from '../../src/components/HomeHeaderButton';

export default function AuthLayout() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Only redirect to main if we have a valid token and loading is done
    if (!navigationState?.key) return;
    if (!loading && token) {
      router.replace("/(main)" as any);
    }
  }, [loading, token, navigationState?.key, router]);

  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackVisible: false,
        headerLeft: () => <HomeHeaderButton destination="/" />,
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
}
