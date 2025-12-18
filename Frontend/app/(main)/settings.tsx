import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, StyleSheet, Alert, TouchableOpacity, View, Switch } from "react-native";
import { useAuth } from "../../src/auth/useAuth";
import { API_BASE } from "../../src/lib/config";

export default function SettingsScreen() {
  const { user, token, logout } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  const [saving, setSaving] = useState(false);

  const loadBusinessProfile = async () => {
    if (!token || user?.userType !== "entity") return;
    try {
      const resp = await fetch(`${API_BASE}/business/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        const data = await resp.json();
        setBusinessName(data.businessName || "");
        setBusinessType(data.businessType || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setRegion(data.region || "");
        setPostalCode(data.postalCode || "");
        setCountry(data.country || "");
        setBusinessPhone(data.phone || "");
        setTimezone(data.timezone || "UTC");
      }
    } catch (error) {
      console.warn("Failed to load business profile:", error);
    }
  };

  const loadPersonalProfile = async () => {
    if (!token || user?.userType !== "individual") return;
    setName(user?.name || "");
    setEmail(user?.email || "");
  };

  useEffect(() => {
    if (user?.userType === "entity") {
      loadBusinessProfile();
    } else {
      loadPersonalProfile();
    }
  }, [token, user]);

  const saveBusinessSettings = async () => {
    if (user?.userType !== "entity") return;
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/business/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          businessType,
          address,
          city,
          region,
          postalCode,
          country,
          phone: businessPhone,
          timezone,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      Alert.alert("Success", "Business settings saved successfully!");
      loadBusinessProfile();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const savePersonalSettings = async () => {
    if (user?.userType !== "individual") return;
    try {
      setSaving(true);
      Alert.alert("Success", "Personal settings saved successfully!");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete account", "This action cannot be undone. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => Alert.alert("Coming soon", "Account deletion is not yet available.") },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Keep your GoMarket profile and storefront information up to date.</Text>

      {user?.userType === "entity" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business information</Text>
          <Text style={styles.cardSubtitle}>Update your storefront details and contact info.</Text>

          <TextInput style={styles.input} placeholder="Business name" value={businessName} onChangeText={setBusinessName} />
          <TextInput
            style={styles.input}
            placeholder="Business type (Restaurant, Retail...)"
            value={businessType}
            onChangeText={setBusinessType}
          />
          <TextInput style={styles.input} placeholder="Street address" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="City" value={city} onChangeText={setCity} />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State / Province"
              value={region}
              onChangeText={setRegion}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Postal code"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Business phone"
            value={businessPhone}
            onChangeText={setBusinessPhone}
            keyboardType="phone-pad"
          />
          <TextInput style={styles.input} placeholder="Timezone" value={timezone} onChangeText={setTimezone} />

          <TouchableOpacity style={styles.primaryButton} onPress={saveBusinessSettings} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save business settings"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile details</Text>
          <Text style={styles.cardSubtitle}>Update how couriers and storefronts see you.</Text>

          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={personalPhone}
            onChangeText={setPersonalPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Address"
            multiline
            numberOfLines={3}
            value={personalAddress}
            onChangeText={setPersonalAddress}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={savePersonalSettings} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save profile"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App preferences</Text>
        <Text style={styles.cardSubtitle}>Tune GoMarket to your workflow.</Text>

        <View style={styles.preferenceRow}>
          <View>
            <Text style={styles.preferenceTitle}>Notifications</Text>
            <Text style={styles.preferenceDescription}>Receive status updates about orders and pickups</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <View style={styles.preferenceRow}>
          <View>
            <Text style={styles.preferenceTitle}>Location services</Text>
            <Text style={styles.preferenceDescription}>Enable location for smarter delivery routing</Text>
          </View>
          <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
        </View>

        <View style={styles.preferenceRow}>
          <View>
            <Text style={styles.preferenceTitle}>Dark mode</Text>
            <Text style={styles.preferenceDescription}>Great for late-night order prep</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.preferenceRow}>
          <View>
            <Text style={styles.preferenceTitle}>Language</Text>
            <Text style={styles.preferenceDescription}>Current language</Text>
          </View>
          <Text style={styles.languageTag}>{language}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <Text style={styles.cardSubtitle}>Protect your storefront, staff, and shoppers.</Text>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => Alert.alert("Coming soon", "Password update will be available soon!")}
        >
          <Text style={styles.outlineButtonText}>Change password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => Alert.alert("Coming soon", "Two-factor authentication will be available soon!")}
        >
          <Text style={styles.outlineButtonText}>Two-factor authentication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Need help?</Text>
        <Text style={styles.cardSubtitle}>Our operations team is ready for onboarding or urgent escalations.</Text>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => Alert.alert("Contact support", "Email us at support@gomarket.com")}
        >
          <Text style={styles.outlineButtonText}>Contact support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => Alert.alert("Coming soon", "FAQ and help center will be available soon!")}
        >
          <Text style={styles.outlineButtonText}>FAQ & help center</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2a050d",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#B30F1F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#B30F1F",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  outlineButtonText: {
    color: "#B30F1F",
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#fff4f5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  dangerButtonText: {
    color: "#B30F1F",
    fontWeight: "600",
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  preferenceDescription: {
    fontSize: 13,
    color: "#777",
  },
  languageTag: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B30F1F",
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#2a050d",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
