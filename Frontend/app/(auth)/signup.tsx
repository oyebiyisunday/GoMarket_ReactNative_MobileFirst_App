import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";

export default function IndividualSignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const autofillOff = {
    autoComplete: "off" as const,
    textContentType: "none" as const,
    importantForAutofill: "no" as const,
    autoCorrect: false,
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirm = () => setShowConfirm((prev) => !prev);

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return Alert.alert("Missing info", "Please enter both first and last name.");
    }
    if (!email.trim() || !phone.trim()) {
      return Alert.alert("Missing info", "Email and phone are required.");
    }
    if (password.length < 8) {
      return Alert.alert("Weak password", "Password must be at least 8 characters.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Password mismatch", "Passwords do not match.");
    }

    try {
      setLoading(true);
      const result = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      const message =
        result.status === "approved"
          ? "Your account has been created. Please log in to continue."
          : "Thank you for registering. Please confirm your registration (check your email) and then log in to continue.";
      Alert.alert("Registration submitted", message, [
        {
          text: "Go to login",
          onPress: () => router.replace("/(auth)/login" as any),
        },
      ]);
    } catch (error: any) {
      const status = error?.status;
      const rawMessage = error?.message || "";
      const lower = rawMessage.toLowerCase();
      const conflict = status === 409 || lower.includes("409") || lower.includes("exist") || lower.includes("duplicate");
      const message = conflict
        ? "An account with this email may already exist. Please log in instead."
        : rawMessage || "Please try again.";

      if (conflict) {
        Alert.alert("Signup conflict", message, [
          { text: "Go to login", onPress: () => router.replace("/(auth)/login" as any) },
          { text: "Cancel", style: "cancel" },
        ]);
      } else {
        Alert.alert("Signup failed", message || "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Individual Account</Text>
      <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} {...autofillOff} />
      <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} {...autofillOff} />
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
        placeholder="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        {...autofillOff}
      />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Password (min 8 chars)"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          {...autofillOff}
        />
        <Text style={styles.toggle} onPress={togglePassword}>
          {showPassword ? "Hide" : "Show"}
        </Text>
      </View>

  <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          {...autofillOff}
        />
        <Text style={styles.toggle} onPress={toggleConfirm}>
          {showConfirm ? "Hide" : "Show"}
        </Text>
      </View>

      <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={onSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? "Creating account..." : "Create account"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.noticeBox} onPress={() => router.push("/(auth)/store-signup" as any)}>
        <Text style={styles.noticeText}>
          Need to register your business or store instead?{" "}
          <Text style={styles.noticeLink}>Submit a store application here.</Text>
        </Text>
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
  noticeBox: {
    borderWidth: 1,
    borderColor: "#f7c6cf",
    backgroundColor: "#fff4f5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 12,
  },
  noticeText: {
    fontSize: 14,
    color: "#7b0f1d",
  },
  noticeLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
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
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  toggle: {
    position: "absolute",
    right: 16,
    top: 14,
    color: "#B30F1F",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#B30F1F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
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
    marginTop: 20,
    fontWeight: "600",
  },
});
