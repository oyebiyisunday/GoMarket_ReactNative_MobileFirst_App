import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "../../src/auth/AuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const autofillOff = {
    autoComplete: "off" as const,
    textContentType: "none" as const,
    importantForAutofill: "no" as const,
    autoCorrect: false,
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Missing info", "Email and password are required.");
    }

    try {
      await login(email.trim(), password.trim());
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login failed", error?.message || "Please check your credentials and try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to manage pickups, orders, and deliveries in one place.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        {...autofillOff}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        {...autofillOff}
      />
      <Text style={styles.toggle} onPress={() => setShowPassword((prev) => !prev)}>
        {showPassword ? "Hide password" : "Show password"}
      </Text>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
        <Text style={styles.link}>Need an individual account? Create one</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/store-signup")}>
        <Text style={styles.link}>Register a store</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2a050d",
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  toggle: {
    textAlign: "right",
    color: "#B30F1F",
    fontWeight: "600",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#B30F1F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    color: "#B30F1F",
    marginTop: 16,
    fontWeight: "600",
  },
});
