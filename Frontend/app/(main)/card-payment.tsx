import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";
import { API_BASE } from "../../src/lib/config";
import { AppColors, AppSpacing } from "../../src/styles/AppStyles";

export default function CardPaymentScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);

  const submitPayment = async () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      Alert.alert("Missing info", "Please enter card number, expiry, CVC, and name.");
      return;
    }
    try {
      setProcessing(true);
      const resp = await fetch(`${API_BASE}/orders/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryType: "pickup", paymentMethod: "card" }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.clientSecret) {
        Alert.alert("Payment Intent created", "Secure payment initialized. Complete the card flow to finish.");
      } else {
        Alert.alert("Payment Success", "Order created. (Stripe disabled or demo mode.)");
      }
      router.replace("/(main)/checkout");
    } catch (e: any) {
      Alert.alert("Payment Error", e.message || "Failed to complete payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Card Payment</Text>
      <Text style={s.subtitle}>Enter your card details to pay securely.</Text>

      <Text style={s.label}>Name on Card</Text>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="John Doe"
        autoCapitalize="words"
      />

      <Text style={s.label}>Card Number</Text>
      <TextInput
        style={s.input}
        value={cardNumber}
        onChangeText={setCardNumber}
        placeholder="4242 4242 4242 4242"
        keyboardType="number-pad"
      />

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={s.label}>Expiry (MM/YY)</Text>
          <TextInput
            style={s.input}
            value={expiry}
            onChangeText={setExpiry}
            placeholder="12/26"
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.label}>CVC</Text>
          <TextInput
            style={s.input}
            value={cvc}
            onChangeText={setCvc}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity style={[s.payBtn, processing && { opacity: 0.6 }]} onPress={submitPayment} disabled={processing}>
        <Text style={s.payText}>{processing ? "Processing..." : "Pay"}</Text>
      </TouchableOpacity>

      <Text style={s.helper}>Payments are processed securely via Stripe.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    padding: AppSpacing.medium,
    flexGrow: 1,
    backgroundColor: "#f6f7fb",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    marginTop: 12,
  },
  payBtn: {
    marginTop: 24,
    backgroundColor: AppColors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  helper: {
    marginTop: 12,
    color: "#777",
    fontSize: 13,
  },
});
