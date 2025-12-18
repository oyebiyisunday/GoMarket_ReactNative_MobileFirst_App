import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={s.center}>
      <Text style={s.title}>Page not found</Text>
      <Text style={{ marginBottom: 12 }}>We couldn't find that screen.</Text>
      <Button title="Go Home" onPress={() => router.replace("/")} />
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});