import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";
import { API_BASE } from "../../src/lib/config";
import { createDemoDelivery, listDeliveriesForSender, DemoDelivery } from "../../src/lib/demoDeliveries";

export default function PickUpScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [items, setItems] = useState("");
  const [packageType, setPackageType] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupZip, setPickupZip] = useState("");
  const [dropoffZip, setDropoffZip] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [instructions, setInstructions] = useState("");
  const [offer, setOffer] = useState("");
  const [receiver, setReceiver] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [lastDelivery, setLastDelivery] = useState<DemoDelivery | null>(null);
  const [myDeliveries, setMyDeliveries] = useState<DemoDelivery[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusHint, setStatusHint] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.userType === "entity") {
      Alert.alert("Access Denied", "Only individual users can access pickups.");
      router.replace("/(main)");
    }
    loadMyDeliveries();
    const interval = setInterval(loadMyDeliveries, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMyDeliveries = () => {
    const senderId = user?.id?.toString?.() || "demo-user";
    const deliveries = listDeliveriesForSender(senderId);
    setMyDeliveries(deliveries);
    if (lastDelivery) {
      const refreshed = deliveries.find((d) => d.id === lastDelivery.id);
      if (refreshed) setLastDelivery(refreshed);
    }
  };

  const submitDeliveryRequest = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!items || !pickup || !dropoff || !pickupZip || !dropoffZip) {
      Alert.alert("Missing info", "Please add items, pickup, dropoff, and zip codes.");
      setSubmitting(false);
      return;
    }
    const offerNum = Number(offer);
    const valueNum = itemValue && !isNaN(Number(itemValue)) ? Number(itemValue) : undefined;
    const weightNum = weight && !isNaN(Number(weight)) ? Number(weight) : undefined;
    if (!weightNum || weightNum <= 0 || !weightUnit.trim()) {
      Alert.alert("Missing weight", "Add the package weight and unit (e.g., 2.5 kg).");
      setSubmitting(false);
      return;
    }
    if (!offer || isNaN(offerNum) || offerNum <= 0) {
      Alert.alert("Payment required", "Please add a payment offer greater than zero.");
      setSubmitting(false);
      return;
    }
    try {
      if (token) {
        try {
          const resp = await fetch(`${API_BASE}/deliveries`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              title: items,
              items,
              pickupAddress: `${pickup}, ${pickupZip}`,
              dropoffAddress: `${dropoff}, ${dropoffZip}`,
              pickupZip,
              dropoffZip,
              packageType: packageType || undefined,
              weight: weightNum,
              weightUnit: weightUnit.trim(),
              itemValue: valueNum,
              instructions: instructions || undefined,
              offer: offerNum,
              receiverName: receiver,
              receiverContact: receiverContact || receiver,
            }),
          });
          if (resp.ok) {
            const created = await resp.json().catch(() => null);
            const withWeight = created
              ? { ...created, weight: created.weight ?? weightNum, weightUnit: created.weightUnit ?? weightUnit.trim() }
              : null;
            setLastDelivery(withWeight as any);
            setSubmitted(true);
            setStatusHint("Request posted. We're notifying the receiver. Watch status updates below.");
            setSubmitting(false);
            setItems(""); setPackageType(""); setWeight(""); setWeightUnit("kg"); setPickup(""); setDropoff(""); setPickupZip(""); setDropoffZip(""); setItemValue(""); setInstructions(""); setOffer(""); setReceiver(""); setReceiverContact("");
            loadMyDeliveries();
            Alert.alert(
              "Delivery created",
              "Request posted successfully. We'll notify the receiver. Proceed to card payment now?",
              [
                { text: "Later" },
                { text: "Pay now", onPress: () => router.push("/(main)/card-payment") },
              ]
            );
            return;
          }
        } catch (err) {
          // fall back to demo
        }
      }
      const delivery = createDemoDelivery({
        title: items,
        items,
        pickupAddress: `${pickup}, ${pickupZip}`,
        dropoffAddress: `${dropoff}, ${dropoffZip}`,
        pickupZip,
        dropoffZip,
        packageType: packageType || undefined,
        weight: weightNum,
        weightUnit: weightUnit.trim(),
        itemValue: valueNum,
        instructions: instructions || undefined,
        offer: offerNum,
        communityId: pickupZip,
        senderId: user?.id?.toString?.() || "demo-user",
        senderName: user?.name,
        receiverName: receiver,
        receiverContact: receiverContact || receiver,
      });
      setLastDelivery(delivery);
      setSubmitted(true);
      setStatusHint("Request posted. We're notifying the receiver. Watch status updates below.");
      setSubmitting(false);
      loadMyDeliveries();
      Alert.alert(
        "Delivery created (demo)",
        "Request posted successfully. We'll notify the receiver. Proceed to card payment now?",
        [
          { text: "Later" },
          { text: "Pay now", onPress: () => router.push("/(main)/card-payment") },
        ]
      );
      setItems(""); setPackageType(""); setWeight(""); setWeightUnit("kg"); setPickup(""); setDropoff(""); setPickupZip(""); setDropoffZip(""); setItemValue(""); setInstructions(""); setOffer(""); setReceiver(""); setReceiverContact("");
    } catch (err) {
      setSubmitting(false);
      Alert.alert("Error", "Failed to create delivery request");
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.header}>Delivery request</Text>
      <Text style={s.subheader}>Add parcel details, pickup/drop-off, zip codes, and a required payment offer.</Text>
      {!submitted ? (
        <View style={s.card}>
          <Text style={s.label}>Items / parcel details</Text>
          <TextInput style={s.input} placeholder="Package from UPS store." value={items} onChangeText={setItems} multiline />
          <Text style={s.label}>Package type</Text>
          <TextInput style={s.input} placeholder="Box, envelope, fragile, perishable" value={packageType} onChangeText={setPackageType} />
          <Text style={s.label}>Weight & unit</Text>
          <View style={s.inputRow}>
            <TextInput style={[s.input, s.flexInput]} placeholder="2.5" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            <TextInput style={[s.input, s.unitInput]} placeholder="kg or lb" value={weightUnit} onChangeText={setWeightUnit} autoCapitalize="none" />
          </View>
          <Text style={s.label}>Pickup location</Text>
          <TextInput style={s.input} placeholder="500 W Madison, Chicago" value={pickup} onChangeText={setPickup} />
          <Text style={s.label}>Pickup ZIP</Text>
          <TextInput style={s.input} placeholder="60661" value={pickupZip} onChangeText={setPickupZip} keyboardType="number-pad" />
          <Text style={s.label}>Drop-off location</Text>
          <TextInput style={s.input} placeholder="123 Main St, Apt 4B" value={dropoff} onChangeText={setDropoff} />
          <Text style={s.label}>Drop-off ZIP</Text>
          <TextInput style={s.input} placeholder="21201" value={dropoffZip} onChangeText={setDropoffZip} keyboardType="number-pad" />
          <Text style={s.label}>Receiver name / contact</Text>
          <TextInput style={s.input} placeholder="Name" value={receiver} onChangeText={setReceiver} />
          <Text style={s.label}>Receiver contact</Text>
          <TextInput style={s.input} placeholder="Phone or email" value={receiverContact} onChangeText={setReceiverContact} />
          <Text style={s.label}>Declared item value (optional)</Text>
          <TextInput style={s.input} placeholder="$40" value={itemValue} onChangeText={setItemValue} keyboardType="decimal-pad" />
          <Text style={s.label}>Payment offer (required)</Text>
          <TextInput style={s.input} placeholder="$20" value={offer} onChangeText={setOffer} keyboardType="decimal-pad" />
          <Text style={s.label}>Special instructions (optional)</Text>
          <TextInput style={s.input} placeholder="Gate code, leave at front desk, etc." value={instructions} onChangeText={setInstructions} multiline />
          <TouchableOpacity style={[s.primaryButton, submitting && s.primaryButtonDisabled]} onPress={submitDeliveryRequest} disabled={submitting}>
            <Text style={s.primaryButtonText}>{submitting ? "Posting..." : "Post delivery request"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {lastDelivery ? (
        <View style={s.card}>
          <Text style={s.confirmLabel}>Delivery created successfully</Text>
          <Text style={s.confirmCode}>{lastDelivery.title}</Text>
          <Text style={s.confirmLink}>{lastDelivery.pickupAddress} {'->'} {lastDelivery.dropoffAddress}</Text>
          {lastDelivery.packageType ? <Text style={s.confirmLink}>Package: {lastDelivery.packageType}</Text> : null}
          {lastDelivery.weight ? (
            <Text style={s.confirmLink}>
              Weight: {lastDelivery.weight}{lastDelivery.weightUnit ? ` ${lastDelivery.weightUnit}` : ""}
            </Text>
          ) : null}
          {lastDelivery.itemValue ? <Text style={s.confirmLink}>Value: ${lastDelivery.itemValue.toFixed(2)}</Text> : null}
          {statusHint ? <Text style={s.statusHint}>{statusHint}</Text> : null}
          <Text style={s.confirmLink}>Status: {lastDelivery.status}</Text>
          <TouchableOpacity style={[s.primaryButton, { marginTop: 12, backgroundColor: "#444" }]} onPress={() => { setSubmitted(false); setSubmitting(false); setLastDelivery(null); }}>
            <Text style={s.primaryButtonText}>Post another request</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {myDeliveries.length > 0 ? (
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <Text style={s.confirmLabel}>My delivery requests</Text>
            <TouchableOpacity onPress={loadMyDeliveries}>
              <Text style={s.link}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {myDeliveries.map((d) => (
            <View key={d.id} style={{ marginBottom: 8 }}>
              <Text style={s.itemTitle}>{d.title}</Text>
              <Text style={s.confirmLink}>{d.pickupAddress} {'->'} {d.dropoffAddress}</Text>
              {d.packageType ? <Text style={s.confirmLink}>Package: {d.packageType}</Text> : null}
              {d.weight ? (
                <Text style={s.confirmLink}>Weight: {d.weight}{d.weightUnit ? ` ${d.weightUnit}` : ""}</Text>
              ) : null}
              <Text style={s.confirmLink}>Status: {d.status}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{flexGrow:1,padding:24,paddingBottom:60,backgroundColor:"#fff"},
  header:{fontSize:26,fontWeight:"700",color:"#2a050d",marginBottom:4},
  subheader:{fontSize:15,color:"#555",marginBottom:20},
  card:{backgroundColor:"#fff",borderRadius:18,borderWidth:1,borderColor:"#f0d1d8",padding:20,shadowColor:"rgba(0,0,0,0.05)",shadowOffset:{width:0,height:8},shadowOpacity:1,shadowRadius:18,elevation:4},
  label:{fontSize:14,fontWeight:"600",color:"#2a050d",marginBottom:6},
  input:{borderWidth:1,borderColor:"#e1e1e1",borderRadius:12,paddingHorizontal:14,paddingVertical:12,fontSize:15,marginBottom:14,backgroundColor:"#fff"},
  inputRow:{flexDirection:"row"},
  flexInput:{flex:1,marginRight:10},
  unitInput:{width:90},
  primaryButton:{backgroundColor:"#B30F1F",paddingVertical:16,borderRadius:12,alignItems:"center",marginTop:4},
  primaryButtonDisabled:{opacity:0.7},
  primaryButtonText:{color:"#fff",fontWeight:"600",fontSize:16},
  confirmCard:{marginTop:16,padding:14,borderRadius:12,borderWidth:1,borderColor:"#f0d1d8",backgroundColor:"#fff6f8"},
  confirmLabel:{fontSize:13,color:"#7c4b54",marginBottom:4},
  confirmCode:{fontSize:18,fontWeight:"700",color:"#B30F1F"},
  confirmLink:{marginTop:4,fontSize:12,color:"#2a050d"},
  statusHint:{marginTop:8,fontSize:12,color:"#7c4b54"},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  link:{color:"#B30F1F",fontWeight:"700"},
  itemTitle:{fontSize:15,fontWeight:"700",color:"#111"},
});
