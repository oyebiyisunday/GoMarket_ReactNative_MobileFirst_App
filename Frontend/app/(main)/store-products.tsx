import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { fetchStoreProducts } from '../../src/api/products';
import { API_BASE } from '../../src/lib/config';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  storeId: string;
};

export default function StoreProductsScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetchStoreProducts(token, 100);
        const fetched: Product[] = (res?.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price ?? 0),
          storeId: p.storeId || p.businessId || 'unknown-store',
        }));
        setProducts(fetched);
      } catch (err) {
        setProducts([]);
      }
    };
    load();
  }, [token]);

  const storeProducts = useMemo(
    () => products.filter(p => p.storeId === storeId),
    [products, storeId]
  );

  const addToCart = async (item: Product) => {
    if (!token) {
      Alert.alert('Login required', 'Please sign in to add items to cart.');
      return;
    }
    try {
      const payload = {
        storeId: item.storeId,
        productId: item.id,
        quantity: 1,
      };
      const res = await fetch(`${API_BASE}/orders/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Added to cart', data.message || 'Product queued for checkout.');
      } else {
        throw new Error(data.error || 'Failed to add');
      }
    } catch (err: any) {
      Alert.alert('Unable to add', err?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Store: {storeId}</Text>
      </View>

      <FlatList
        data={storeProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? <Text style={styles.cardBody}>{item.description}</Text> : null}
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => addToCart(item)}>
                <Text style={styles.primaryButtonText}>Add to cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items for this store.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { color: '#d00', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', color: '#1b1b1b' },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1b1b1b' },
  cardBody: { marginTop: 6, color: '#444', fontSize: 13 },
  price: { marginTop: 10, fontWeight: '700', color: '#d00', fontSize: 15 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  primaryButton: { backgroundColor: '#d00', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 32, color: '#777' },
});
