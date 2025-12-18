import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>Go</Text>
        </View>

        <Text style={styles.title}>GoMarket</Text>
        <Text style={styles.subtitle}>Pick from store. Send packages. Receive with confidence.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.helper}>Shop, send, and receive in one place.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 18,
  },
  logoBox: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: "#B30F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6c6c6c",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 32,
    width: "100%",
    backgroundColor: "#B30F1F",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  helper: {
    marginTop: 32,
    fontSize: 13,
    color: "#9c9c9c",
    textAlign: "center",
  },
});
