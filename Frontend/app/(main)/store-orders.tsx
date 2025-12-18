import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { apiFetch } from '../../src/lib/api';
import { API_BASE } from '../../src/lib/config';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';

type OrderItem = { name: string; quantity: number };
type StoreOrder = {
  id: string;
  orderNumber?: string;
  customerName?: string;
  total?: number;
  status: string;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  address?: string;
  items?: OrderItem[];
  createdAt?: string;
};

const sampleOrders: StoreOrder[] = [
  {
    id: 'o1',
    orderNumber: 'GM-2001',
    customerName: 'Ada L.',
    total: 48.5,
    status: 'pending',
    paymentStatus: 'unpaid',
    address: '123 Pratt St, Baltimore',
    items: [
      { name: 'Jollof Spice Mix', quantity: 2 },
      { name: 'Veggie Box', quantity: 1 },
    ],
    createdAt: 'Today 9:12 AM',
  },
  {
    id: 'o2',
    orderNumber: 'GM-2000',
    customerName: 'Tunde A.',
    total: 26,
    status: 'preparing',
    paymentStatus: 'paid',
    address: '45 Light St, Baltimore',
    items: [{ name: 'Espresso Beans 500g', quantity: 1 }],
    createdAt: 'Today 8:40 AM',
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#B30F1F',
  accepted: '#B30F1F',
  preparing: '#b26a00',
  ready: '#2e7d32',
  completed: '#4b5563',
};

export default function StoreOrders() {
  const { token } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderPriority = (o: StoreOrder) => {
    if (o.paymentStatus === 'unpaid') return 0;
    if (o.status === 'pending') return 1;
    if (o.status === 'accepted') return 2;
    if (o.status === 'preparing') return 3;
    if (o.status === 'ready') return 4;
    return 5;
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!token) {
        setOrders([...sampleOrders].sort((a, b) => orderPriority(a) - orderPriority(b)));
        return;
      }
      const data = await apiFetch(`${API_BASE}/orders?storeId=me`);
      const list: StoreOrder[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const sorted = (list.length ? list : sampleOrders).slice().sort((a, b) => orderPriority(a) - orderPriority(b));
      setOrders(sorted);
    } catch (e) {
      console.warn('loadOrders fallback:', e);
      setOrders([...sampleOrders].sort((a, b) => orderPriority(a) - orderPriority(b)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const nextStatus = (status: string) => {
    const flow = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
    const idx = flow.indexOf(status);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'completed';
  };

  const primaryActionLabel = (status: string) => {
    if (status === 'pending') return 'Accept';
    if (status === 'accepted') return 'Start prep';
    if (status === 'preparing') return 'Accept';
    if (status === 'ready') return 'Complete';
    return 'Update';
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdating(true);
      if (!token) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        return;
      }
      await apiFetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
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

  const notifyCustomer = (o: StoreOrder, note: string) => {
    Alert.alert('Customer notified', `${o.customerName || 'Customer'} was notified: ${note}`);
  };

  const renderOrder = ({ item: o }: { item: StoreOrder }) => (
    <View style={[styles.card, isTablet && styles.cardWide]}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={styles.orderId}>{o.orderNumber || o.id}</Text>
          <Text style={styles.metaSmall}>{o.createdAt || ''}</Text>
        </View>
        <View style={[styles.statusPill, { borderColor: STATUS_COLORS[o.status] || '#ccc', backgroundColor: '#fdf6f6' }]}>
          <Text style={[styles.statusPillText, { color: STATUS_COLORS[o.status] || '#444' }]}>{o.status}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.customer}>{o.customerName || 'Customer'}</Text>
        <View
          style={[
            styles.paymentChip,
            o.paymentStatus === 'paid' ? styles.paymentChipPaid : styles.paymentChipNeutral,
          ]}
        >
          <Text
            style={[
              styles.paymentChipText,
              o.paymentStatus === 'paid' ? styles.paymentChipTextPaid : styles.paymentChipTextNeutral,
            ]}
          >
            {(o.paymentStatus || 'unpaid').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.itemsText}>
        {o.items?.length
          ? `${o.items.length} item${o.items.length > 1 ? 's' : ''} - ${o.items.map((i) => i.name).join(', ')}`
          : 'No items'}
      </Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalText}>${o.total?.toFixed(2) || '0.00'}</Text>
          {o.address ? <Text style={styles.metaSmall}>{o.address}</Text> : null}
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, updating && { opacity: 0.7 }]}
            onPress={() => updateStatus(o.id, nextStatus(o.status))}
            disabled={updating}
          >
            <Text style={styles.primaryBtnText}>{primaryActionLabel(o.status)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => notifyCustomer(o, 'Ready for pickup')}
          >
            <Text style={styles.secondaryBtnText}>Notify ready</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Store Orders</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadOrders} disabled={loading}>
          <Text style={styles.refreshText}>{loading ? 'Loading...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={renderOrder}
        onRefresh={loadOrders}
        refreshing={loading}
        ListEmptyComponent={
          !loading ? <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No orders yet.</Text> : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: AppSpacing.medium },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.secondary,
  },
  refreshText: { color: AppColors.secondary, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWide: { flexDirection: 'column' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#111' },
  customer: { fontSize: 15, fontWeight: '700', color: '#111' },
  itemsText: { color: '#555', marginTop: 8 },
  metaSmall: { color: '#666', fontSize: 12, marginTop: 2 },
  totalText: { fontSize: 18, fontWeight: '800', color: '#111' },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: { fontWeight: '700', color: '#444', fontSize: 12 },
  paymentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentChipPaid: { backgroundColor: '#e8f7ed', borderColor: '#5fbf7a' },
  paymentChipNeutral: { backgroundColor: '#f7f7f7', borderColor: '#d7d7d7' },
  paymentChipText: { fontWeight: '700', fontSize: 12 },
  paymentChipTextPaid: { color: '#2e7d32' },
  paymentChipTextNeutral: { color: '#444' },
  actionsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryBtn: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: 110,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#111', fontWeight: '700', fontSize: 13 },
});
