import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { apiFetch } from '../../src/lib/api';
import { addDemoItemStrict } from '../../src/lib/demoCart';
import { AppColors } from '../../src/styles/AppStyles';

type Product = {
  id: string;
  productId: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currentStock: number;
  imageUrl?: string;
  isSample?: boolean;
};

export default function StoreCatalogScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});

  const normalizedStoreId = (storeId as string) || 'tu-coffee';
  const title = useMemo(() => (normalizedStoreId ? `Store: ${normalizedStoreId}` : 'Store'), [normalizedStoreId]);

  const sampleProducts: Record<string, Product[]> = {
    'african-market': [
      { id: 's-af-1', productId: 'af-p-1', name: 'Jollof Spice Mix', description: 'Signature peppers + spices', price: 12, currentStock: 20, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-af-2', productId: 'af-p-2', name: 'Yam Tubers (5kg)', description: 'Fresh tubers, ready to cook', price: 18, currentStock: 15, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-af-3', productId: 'af-p-3', name: 'Cocoa Beans (1kg)', description: 'Farm-direct, sun dried', price: 22, currentStock: 10, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
    'tu-coffee': [
      { id: 's-tu-1', productId: 'tu-p-1', name: 'Espresso Beans 500g', description: 'Single origin, medium roast', price: 16, currentStock: 25, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-tu-2', productId: 'tu-p-2', name: 'Cold Brew Pack (6 bottles)', description: 'Ready to drink, low acidity', price: 24, currentStock: 12, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
    'daily-cafe': [
      { id: 's-da-1', productId: 'da-p-1', name: 'Breakfast Combo', description: 'Croissant + latte', price: 9, currentStock: 30, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-da-2', productId: 'da-p-2', name: 'Iced Latte', description: 'House blend, classic', price: 5, currentStock: 40, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
    'gotech-hub': [
      { id: 's-go-1', productId: 'go-p-1', name: 'Wireless Earbuds', description: 'ANC, 24h battery', price: 59, currentStock: 18, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-go-2', productId: 'go-p-2', name: 'Laptop Stand', description: 'Aluminum, adjustable', price: 32, currentStock: 22, imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
    'green-basket': [
      { id: 's-gr-1', productId: 'gr-p-1', name: 'Veggie Box', description: 'Seasonal greens bundle', price: 20, currentStock: 25, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-gr-2', productId: 'gr-p-2', name: 'Fruit Medley', description: 'Mixed berries & citrus', price: 18, currentStock: 30, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
    'style-loft': [
      { id: 's-st-1', productId: 'st-p-1', name: 'Denim Jacket', description: 'Classic indigo, unisex', price: 72, currentStock: 14, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', isSample: true },
      { id: 's-st-2', productId: 'st-p-2', name: 'Soft Tee', description: 'Organic cotton, crew neck', price: 24, currentStock: 35, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', isSample: true },
    ],
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!token) {
          setProducts(sampleProducts[normalizedStoreId] || []);
          return;
        }
        const data = await apiFetch(`${API_BASE}/catalog/stores/${normalizedStoreId}/products`, { headers: { Authorization: `Bearer ${token}` } });
        const list: Product[] = data?.products || data?.data || [];
        if (list.length === 0 && sampleProducts[normalizedStoreId]) {
          setProducts(sampleProducts[normalizedStoreId]);
        } else {
          setProducts(list);
        }
      } catch (e) {
        if (sampleProducts[normalizedStoreId]) {
          setProducts(sampleProducts[normalizedStoreId]);
        } else {
          Alert.alert('Error', 'Failed to load store');
        }
      } finally { setLoading(false); }
    })();
  }, [normalizedStoreId, token]);

  const changeQty = (pid: string, delta: number) => {
    setQty(prev => ({ ...prev, [pid]: Math.max(0, (prev[pid] || 0) + delta) }));
  };

  const addToCart = async (p: Product, count: number) => {
    if (!count) return;
    const targetStoreId = normalizedStoreId || 'demo-store';

    const addDemo = () => addDemoItemStrict({
      productId: p.productId,
      storeId: targetStoreId,
      name: p.name,
      quantity: count,
      price: p.price,
    });

    try {
      if (p.isSample || !token) {
        const res = addDemo();
        if (!res.ok) throw new Error(res.error || 'Cannot add item');
        Alert.alert('Added to cart', `${p.name} x${count} (demo)`);
        return;
      }

      const res = await fetch(`${API_BASE}/orders/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeId: targetStoreId, productId: p.productId, quantity: count })
      });
      if (!res.ok) {
        throw new Error('Add to cart failed');
      }
    } catch (err: any) {
      const res = addDemo();
      if (!res.ok) {
        throw new Error(res.error || err?.message || 'Add to cart failed');
      }
      Alert.alert('Added to cart', `${p.name} x${count} (demo)`);
    }
  };

  const totalSelected = Object.values(qty).reduce((a, b) => a + (b || 0), 0);

  const checkout = async () => {
    try {
      const sel = Object.entries(qty).filter(([_, c]) => c && c > 0);
      if (sel.length === 0) { Alert.alert('Cart empty', 'Select at least one item'); return; }
      for (const [pid, count] of sel) {
        const p = products.find(x => x.productId === pid || x.id === pid);
        if (p) await addToCart(p, count as number);
      }
      router.push('/(main)/checkout');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to checkout');
    }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>Browse products and add to cart</Text>

      {loading ? (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={AppColors.secondary} />
          <Text style={s.loadingText}>Loading items...</Text>
        </View>
      ) : (
        <>
          {products.map((p) => (
            <View key={p.id} style={s.card}>
              <View style={s.row}>
                {p.imageUrl ? (
                  <Image source={{ uri: p.imageUrl }} style={s.image} />
                ) : (
                  <View style={[s.image, s.placeholder]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.pName}>{p.name}</Text>
                  {p.description ? (
                    <Text style={s.pDesc} numberOfLines={2}>
                      {p.description}
                    </Text>
                  ) : null}
                  <Text style={s.pMeta}>${p.price.toFixed(2)} | Stock: {p.currentStock}</Text>
                  <View style={s.qtyRow}>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => changeQty(p.productId, -1)}>
                      <Text style={s.qtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={s.qtyVal}>{qty[p.productId] || 0}</Text>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => changeQty(p.productId, +1)}>
                      <Text style={s.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[s.checkoutBtn, totalSelected === 0 && { backgroundColor: '#bdbdbd' }]}
            onPress={checkout}
            disabled={totalSelected === 0}
          >
            <Text style={s.checkoutText}>
              {totalSelected > 0 ? `Review Order (${totalSelected})` : 'Select items to proceed'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#333' },
  subtitle: { color: '#666', marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', gap: 12 },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#eee' },
  placeholder: { backgroundColor: '#f0f0f0' },
  pName: { fontWeight: '700', color: '#333' },
  pDesc: { color: '#666', marginTop: 4 },
  pMeta: { color: AppColors.secondary, marginTop: 6, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: '#333', fontWeight: '700' },
  qtyVal: { minWidth: 24, textAlign: 'center', color: '#333' },
  checkoutBtn: { backgroundColor: AppColors.secondary, padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 16 },
  checkoutText: { color: '#fff', fontWeight: '700' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  loadingText: { color: '#666' },
});
