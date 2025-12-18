import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";

export default function SupportChatScreen() {
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [ready, setReady] = useState(false);

  const handleSubmit = () => {
    if (!contact.trim() || !topic.trim()) {
      return Alert.alert("Missing info", "Please share contact info and topic.");
    }
    setReady(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chat with us</Text>
      <Text style={styles.subtitle}>Tell us how to reach you and what you need help with.</Text>

      {!ready ? (
        <View style={styles.card}>
          <Text style={styles.label}>Email or phone</Text>
          <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="you@example.com" />

          <Text style={styles.label}>Topic</Text>
          <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="Delivery issue, product question..." />

          <Text style={styles.label}>Details (optional)</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            value={details}
            onChangeText={setDetails}
            placeholder="Add extra context for our team"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryText}>Start live chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Live chat</Text>
          <Text style={styles.helper}>Thanks! An agent is ready to connect.</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryText}>Open chat window</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2a050d",
    marginBottom: 6,
  },
  subtitle: {
    color: "#555",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0d1d8",
    padding: 18,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#2a050d",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#B30F1F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  helper: {
    color: "#6c5a5f",
    marginBottom: 12,
  },
});
