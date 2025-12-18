import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { apiFetch } from '../../src/lib/api';
import { API_BASE } from '../../src/lib/config';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';
import { listDeliveriesForDriver, assignToDriver, markDelivered, DemoDelivery } from '../../src/lib/demoDeliveries';

type DriverOrder = {
  id: string;
  orderNumber?: string;
  customerName?: string;
  total?: number;
  status: string;
  address?: string;
  lat?: number;
  lon?: number;
  createdAt?: string;
};

const sampleDriverOrders: DriverOrder[] = [
  {
    id: 'd1',
    orderNumber: 'GM-2001',
    customerName: 'Ada L.',
    total: 48.5,
    status: 'assigned',
    address: '123 Pratt St, Baltimore',
    lat: 39.285,
    lon: -76.613,
    createdAt: 'Today · 9:12 AM',
  },
  {
    id: 'd2',
    orderNumber: 'GM-1999',
    customerName: 'Luis R.',
    total: 32.0,
    status: 'on_the_way',
    address: '450 Light St, Baltimore',
    lat: 39.281,
    lon: -76.610,
    createdAt: 'Today · 8:05 AM',
  },
];

export default function DriverOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [deliveries, setDeliveries] = useState<DemoDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const driverCommunity = (user as any)?.zip || (user as any)?.postalCode || '';

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!token) {
        setOrders(sampleDriverOrders);
        setDeliveries(listDeliveriesForDriver().filter((d) => !driverCommunity || d.communityId === driverCommunity));
        return;
      }
      const data = await apiFetch(`${API_BASE}/driver/orders?status=assigned,on_the_way`);
      const list: DriverOrder[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrders(list.length ? list : sampleDriverOrders);
      setDeliveries(
        listDeliveriesForDriver(user?.id?.toString?.()).filter((d) => !driverCommunity || d.communityId === driverCommunity)
      );
    } catch (e) {
      console.warn('load driver orders fallback:', e);
      setOrders(sampleDriverOrders);
      setDeliveries(
        listDeliveriesForDriver().filter((d) => !driverCommunity || d.communityId === driverCommunity)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const nextStatus = (status: string) => {
    const flow = ['assigned', 'on_the_way', 'delivered'];
    const idx = flow.indexOf(status);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'delivered';
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdating(true);
      if (!token) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        return;
      }
      await apiFetch(`${API_BASE}/driver/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (e: any) {
      Alert.alert('Update failed', e.message || 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  const acceptDelivery = (id: string) => {
    assignToDriver(id, user?.id?.toString?.() || 'demo-driver');
    setDeliveries(listDeliveriesForDriver(user?.id?.toString?.()));
  };

  const completeDelivery = (id: string) => {
    markDelivered(id, user?.id?.toString?.());
    setDeliveries(listDeliveriesForDriver(user?.id?.toString?.()));
    Alert.alert('Marked delivered', 'Receiver must confirm receipt to complete.');
  };

  const openNavigation = (o: DriverOrder) => {
    if (o.lat && o.lon) {
      const dest = `${o.lat},${o.lon}`;
      const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
      const apple = `http://maps.apple.com/?daddr=${dest}`;
      const url = Platform.OS === 'ios' ? apple : gmaps;
      Linking.openURL(url).catch(() => Alert.alert('Navigation', 'Unable to open maps.'));
    } else if (o.address) {
      const encoded = encodeURIComponent(o.address);
      const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
      Linking.openURL(gmaps).catch(() => Alert.alert('Navigation', 'Unable to open maps.'));
    } else {
      Alert.alert('Navigation', 'No address provided.');
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={s.header}>
        <Text style={s.title}>Driver Orders</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={loadOrders} disabled={loading}>
          <Text style={s.refreshText}>{loading ? 'Loading...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={AppColors.secondary} />
      ) : (
        orders.map((o) => (
          <View key={o.id} style={s.card}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.orderId}>{o.orderNumber || o.id}</Text>
                <Text style={s.meta}>{o.customerName || 'Customer'} · ${o.total?.toFixed(2) || '0.00'}</Text>
                {o.address ? <Text style={s.meta}>{o.address}</Text> : null}
                {o.createdAt ? <Text style={s.meta}>{o.createdAt}</Text> : null}
              </View>
              <Text style={[s.status, { color: AppColors.secondary }]}>{o.status}</Text>
            </View>

            <View style={s.actionRow}>
              <TouchableOpacity style={s.navBtn} onPress={() => openNavigation(o)}>
                <Text style={s.navText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.primaryBtn, updating && { opacity: 0.7 }]}
                onPress={() => updateStatus(o.id, nextStatus(o.status))}
                disabled={updating}
              >
                <Text style={s.primaryText}>Mark {nextStatus(o.status)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      {!loading && orders.length === 0 ? <Text style={{ color: '#666' }}>No assigned orders yet.</Text> : null}

      <View style={[s.header, { marginTop: 16 }]}>
        <Text style={s.title}>Delivery Requests</Text>
      </View>
      {deliveries.map((d) => {
        const showAccept = d.status === 'awaiting_driver';
        const showComplete = d.status === 'assigned' && d.assignedDriverId === (user?.id?.toString?.() || 'demo-driver');
        return (
          <View key={d.id} style={s.card}>
            <Text style={s.orderId}>{d.title}</Text>
            <Text style={s.meta}>{d.pickupAddress} → {d.dropoffAddress}</Text>
            {d.packageType ? <Text style={s.meta}>Package: {d.packageType}</Text> : null}
            {d.weight ? <Text style={s.meta}>Weight: {d.weight}{d.weightUnit ? ` ${d.weightUnit}` : ''}</Text> : null}
            {d.offer ? <Text style={s.meta}>Offer: ${d.offer.toFixed(2)}</Text> : null}
            <Text style={s.meta}>Status: {d.status}</Text>
            <View style={s.actionRow}>
              <TouchableOpacity style={s.navBtn} onPress={() => openNavigation(d)}>
                <Text style={s.navText}>Navigate</Text>
              </TouchableOpacity>
              {showAccept ? (
                <TouchableOpacity style={s.primaryBtn} onPress={() => acceptDelivery(d.id)}>
                  <Text style={s.primaryText}>Accept</Text>
                </TouchableOpacity>
              ) : showComplete ? (
                <TouchableOpacity style={s.primaryBtn} onPress={() => completeDelivery(d.id)}>
                  <Text style={s.primaryText}>Mark delivered</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );
      })}
      {!loading && deliveries.length === 0 ? <Text style={{ color: '#666' }}>No delivery requests ready.</Text> : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: AppSpacing.medium },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  refreshBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: AppColors.secondary },
  refreshText: { color: AppColors.secondary, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 16, fontWeight: '800', color: '#111' },
  meta: { color: '#666', marginTop: 2 },
  status: { fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  navBtn: { flex: 1, borderWidth: 1.5, borderColor: AppColors.secondary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  navText: { color: AppColors.secondary, fontWeight: '700' },
  primaryBtn: { flex: 1, backgroundColor: AppColors.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
