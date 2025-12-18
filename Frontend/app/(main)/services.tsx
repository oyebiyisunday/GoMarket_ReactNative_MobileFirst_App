import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";

export default function ServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.userType === "entity") {
      Alert.alert("Access Denied", "Only individual users can access services.");
      router.replace("/(main)");
    }
  }, [user]);

  const alertDisabled = () => {
    Alert.alert("Unavailable", "Task posting is disabled in this build.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Services</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Task posting is disabled in this build.</Text>
        <Text style={styles.link} onPress={alertDisabled}>OK</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb" },
  content: { padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#111" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#eee" },
  text: { color: "#333", marginBottom: 12 },
  link: { color: "#B30F1F", fontWeight: "700" },
});
