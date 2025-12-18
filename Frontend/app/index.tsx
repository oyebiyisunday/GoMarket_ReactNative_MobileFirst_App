// app/index.tsx - Root entry point
import { Redirect, useRootNavigationState } from "expo-router";
import { useAuth } from "../src/auth/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function RootIndex() {
  const { token, loading } = useAuth();
  const navState = useRootNavigationState();

  // Wait for navigation container + auth state
  if (loading || !navState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Authenticated → landing feed, otherwise show auth welcome
  if (token) return <Redirect href="/landing" />;
  return <Redirect href="/(auth)/welcome" />;
}
