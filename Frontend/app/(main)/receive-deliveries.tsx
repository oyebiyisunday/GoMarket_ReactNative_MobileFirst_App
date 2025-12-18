import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';
import { listDeliveriesForReceiver, markReceiverReady, confirmReceived, DemoDelivery } from '../../src/lib/demoDeliveries';

export default function ReceiveDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DemoDelivery[]>([]);

  const receiverCommunity = (user as any)?.zip || (user as any)?.postalCode || '';

  const load = () => {
    const list = listDeliveriesForReceiver().filter((d) => !receiverCommunity || d.communityId === receiverCommunity);
    setDeliveries(list);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAck = (id: string) => {
    markReceiverReady(id);
    Alert.alert('Acknowledged', 'Drivers can now view and accept this delivery.');
    load();
  };

  const handleConfirm = (id: string) => {
    confirmReceived(id);
    Alert.alert('Received', 'Delivery marked as completed.');
    load();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>Receive deliveries</Text>
      {deliveries.map((d) => {
        const showAck = d.status === 'awaiting_receiver';
        const showConfirm = d.status === 'delivered_pending_receiver';
        return (
          <View key={d.id} style={s.card}>
            <Text style={s.orderId}>{d.title}</Text>
            <Text style={s.meta}>{d.pickupAddress} → {d.dropoffAddress}</Text>
            {d.packageType ? <Text style={s.meta}>Package: {d.packageType}</Text> : null}
            {d.weight ? <Text style={s.meta}>Weight: {d.weight}{d.weightUnit ? ` ${d.weightUnit}` : ''}</Text> : null}
            {d.offer ? <Text style={s.meta}>Offer: ${d.offer.toFixed(2)}</Text> : null}
            <Text style={s.meta}>Status: {d.status}</Text>
            <View style={s.actionRow}>
              {showAck ? (
                <TouchableOpacity style={s.primaryBtn} onPress={() => handleAck(d.id)}>
                  <Text style={s.primaryText}>Confirm you are expecting this item</Text>
                </TouchableOpacity>
              ) : showConfirm ? (
                <TouchableOpacity style={s.primaryBtn} onPress={() => handleConfirm(d.id)}>
                  <Text style={s.primaryText}>Confirm received</Text>
                </TouchableOpacity>
              ) : (
                <Text style={s.meta}>Waiting for driver</Text>
              )}
            </View>
          </View>
        );
      })}
      {deliveries.length === 0 ? <Text style={{ color: '#666', marginTop: 10 }}>No deliveries to receive right now.</Text> : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: AppSpacing.medium },
  title: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  orderId: { fontSize: 16, fontWeight: '800', color: '#111' },
  meta: { color: '#666', marginTop: 2 },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 10, alignItems: 'center' },
  primaryBtn: { flex: 1, backgroundColor: AppColors.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
