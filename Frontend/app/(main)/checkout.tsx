import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { getDemoCart, clearDemoCart } from '../../src/lib/demoCart';
import { AppColors } from '../../src/styles/AppStyles';

type CartItem = { productId: string; name: string; quantity: number; price: number; storeId?: string };

export default function CheckoutReview() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const loadCart = async () => {
    try {
      setLoading(true);
      let mapped: CartItem[] = [];

      // Try backend first if we have a token
      if (token) {
        try {
          const resp = await fetch(`${API_BASE}/orders/cart`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await resp.json();
          const arr = data.data?.items || data.items || [];
          mapped = arr.map((i: any) => ({
            productId: i.productId || i.product?.id || i.id,
            name: i.name || i.product?.name || i.productId,
            quantity: i.quantity,
            price: i.price || i.unitPrice || i.finalPrice || 0,
            storeId: i.storeId || i.product?.business?.storeId
          }));
        } catch (e) {
          // ignore and fall through to demo
        }
      }

      // Fallback to demo cart if backend empty or failed
      if (mapped.length === 0) {
        const demo = getDemoCart();
        if (demo.length > 0) {
          mapped = demo;
        }
      }

      setItems(mapped);
    } catch (err) {
      const demo = getDemoCart();
      setItems(demo);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadCart(); }, []);

  const goBack = () => {
    if ((router as any)?.canGoBack?.()) {
      router.back();
    } else {
      router.push('/(main)/shopping' as any);
    }
  };

  const payWithStripe = async () => {
    const demo = getDemoCart();
    if (demo.length > 0 && items.length === demo.length) {
      clearDemoCart();
      Alert.alert('Payment Success', 'Demo checkout completed.');
      setItems([]);
      return;
    }

    try {
      const ck = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryType: 'pickup', paymentMethod: 'card' })
      });
      if (!ck.ok) throw new Error('Checkout failed');
      const resp = await ck.json();
      const orders = resp?.data?.orders || resp?.orders || [];
      if (!orders.length) {
        Alert.alert('Payment Success', 'Your order has been placed.');
      } else if (orders.length === 1) {
        Alert.alert('Payment Success', `Order ${orders[0].orderNumber || orders[0].id} completed.`);
      } else {
        const list = orders
          .slice(0, 3)
          .map((o: any) => o.orderNumber || o.id)
          .join(', ');
        Alert.alert('Payment Success', `Created ${orders.length} orders: ${list}${orders.length>3?'.':''}`);
      }
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'Failed to complete payment');
    }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Order Review</Text>
      {items.length === 0 && !loading ? (
        <Text style={{ color:'#666', marginTop:8 }}>Your cart is empty.</Text>
      ) : (
        <View style={s.card}>
          {items.map((i, idx) => (
            <View key={`${i.productId}-${idx}`} style={s.row}>
              <Text style={s.name}>{i.name}</Text>
              <Text style={s.qty}>x{i.quantity}</Text>
              <Text style={s.price}>${(i.price * i.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={[s.row,{ borderTopWidth:1, borderTopColor:'#eee', paddingTop:10, marginTop:6 }]}
          >
            <Text style={[s.name,{ fontWeight:'700' }]}>Total</Text>
            <View style={{ flex:1 }} />
            <Text style={[s.price,{ fontWeight:'700' }]}>${total.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={s.backBtn} onPress={goBack}>
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.payBtn, { marginTop: 0, marginBottom: 8 }]}
        onPress={() => router.push('/(main)/card-payment' as any)}
      >
        <Text style={s.payText}>Enter Card Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.payBtn, (items.length===0) && { backgroundColor:'#dba2aa' }]}
        disabled={items.length===0}
        onPress={payWithStripe}
      >
        <Text style={s.payText}>Pay with Stripe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  row: { flexDirection:'row', alignItems:'center', marginBottom: 8 },
  name: { flex:1, color:'#333' },
  qty: { width: 50, textAlign:'center', color:'#666' },
  price: { width: 100, textAlign:'right', color:'#333' },
  payBtn: { backgroundColor: AppColors.secondary, padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 16 },
  payText: { color:'#fff', fontWeight:'700' },
  backBtn: { borderColor: AppColors.secondary, borderWidth: 1.5, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  backText: { color: AppColors.secondary, fontWeight: '700' },
});
