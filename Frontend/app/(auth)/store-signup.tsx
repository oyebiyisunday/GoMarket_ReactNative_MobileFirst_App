import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { API_BASE } from "../../src/lib/config";

type SupportingDoc = {
  uri: string;
  name: string;
};

export default function StoreSignupScreen() {
  const router = useRouter();
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [staffSize, setStaffSize] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [docs, setDocs] = useState<SupportingDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const autofillOff = {
    autoComplete: "off" as const,
    textContentType: "none" as const,
    importantForAutofill: "no" as const,
    autoCorrect: false,
  };

  const ensureMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to select supporting documents.");
      return false;
    }
    return true;
  };

  const handlePickDoc = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setDocs((prev) => [
        ...prev,
        {
          uri: asset.uri,
          name: asset.fileName || `Document ${prev.length + 1}`,
        },
      ]);
    }
  };

  const removeDoc = (uri: string) => {
    setDocs((prev) => prev.filter((doc) => doc.uri !== uri));
  };

  const onSubmit = async () => {
    if (!ownerFirstName.trim() || !ownerLastName.trim()) {
      return Alert.alert("Missing info", "Owner first and last name are required.");
    }
    if (!ownerEmail.trim() || !ownerPhone.trim()) {
      return Alert.alert("Missing info", "Owner email and phone are required.");
    }
    if (!businessName.trim() || !businessEmail.trim() || !businessPhone.trim()) {
      return Alert.alert("Missing info", "Business name, email, and phone are required.");
    }

    try {
      setSubmitting(true);
      const payload = {
        ownerFirstName: ownerFirstName.trim(),
        ownerLastName: ownerLastName.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerPhone: ownerPhone.trim(),
        businessName: businessName.trim(),
        businessEmail: businessEmail.trim().toLowerCase(),
        businessPhone: businessPhone.trim(),
        businessLocation: businessLocation.trim(),
        businessAddress: businessAddress.trim(),
        registrationNumber: registrationNumber.trim(),
        category: category.trim(),
        yearsInBusiness: yearsInBusiness.trim(),
        staffSize: staffSize.trim(),
        website: website.trim(),
        description: description.trim(),
        supportingDocs: docs,
      };

      const response = await fetch(`${API_BASE}/business-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to submit application");
      }

      Alert.alert(
        "Application submitted",
        "Thank you! Your store application is being reviewed. Please check your email for approval status and onboarding instructions."
      );
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Submission failed", error?.message || "Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Register Your Store</Text>
      <Text style={styles.subtitle}>
        Complete the application below. Once approved, you will receive login credentials and onboarding details via
        email.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Owner Details</Text>
        <TextInput style={styles.input} placeholder="Owner first name" value={ownerFirstName} onChangeText={setOwnerFirstName} {...autofillOff} />
        <TextInput style={styles.input} placeholder="Owner last name" value={ownerLastName} onChangeText={setOwnerLastName} {...autofillOff} />
        <TextInput
          style={styles.input}
          placeholder="Owner email"
          value={ownerEmail}
          onChangeText={setOwnerEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Owner phone"
          value={ownerPhone}
          onChangeText={setOwnerPhone}
          keyboardType="phone-pad"
          {...autofillOff}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Details</Text>
        <TextInput style={styles.input} placeholder="Business name" value={businessName} onChangeText={setBusinessName} {...autofillOff} />
        <TextInput
          style={styles.input}
          placeholder="Business email"
          value={businessEmail}
          onChangeText={setBusinessEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Business phone"
          value={businessPhone}
          onChangeText={setBusinessPhone}
          keyboardType="phone-pad"
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Location / City & State"
          value={businessLocation}
          onChangeText={setBusinessLocation}
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Physical address"
          value={businessAddress}
          onChangeText={setBusinessAddress}
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Business registration number"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          {...autofillOff}
        />
        <TextInput style={styles.input} placeholder="Business category" value={category} onChangeText={setCategory} {...autofillOff} />
        <TextInput
          style={styles.input}
          placeholder="Years in operation"
          value={yearsInBusiness}
          onChangeText={setYearsInBusiness}
          keyboardType="numeric"
          {...autofillOff}
        />
        <TextInput
          style={styles.input}
          placeholder="Number of employees"
          value={staffSize}
          onChangeText={setStaffSize}
          keyboardType="numeric"
          {...autofillOff}
        />
        <TextInput style={styles.input} placeholder="Website / social link" value={website} onChangeText={setWebsite} {...autofillOff} />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Describe your products, services, delivery areas…"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          {...autofillOff}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supporting Documents</Text>
        <Text style={styles.sectionHelp}>Upload registration certificates, IDs, or utility bills (images/screenshots are accepted).</Text>
        {docs.map((doc) => (
          <View key={doc.uri} style={styles.docRow}>
            <Text style={styles.docName}>{doc.name}</Text>
            <TouchableOpacity onPress={() => removeDoc(doc.uri)}>
              <Text style={styles.docRemove}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.outlineButton} onPress={handlePickDoc}>
          <Text style={styles.outlineButtonText}>Add supporting document</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Submit application</Text>}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        After submission, our team reviews your documents. You will receive approval updates and login credentials via email.
      </Text>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.backToLogin}>Back to login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2a050d",
    marginTop: 40,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#2a050d",
  },
  sectionHelp: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#B30F1F",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#B30F1F",
    fontWeight: "600",
  },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  docName: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  docRemove: {
    color: "#B30F1F",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#B30F1F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footerNote: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  backToLogin: {
    textAlign: "center",
    marginTop: 16,
    color: "#B30F1F",
    fontWeight: "600",
  },
});
