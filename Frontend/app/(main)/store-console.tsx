import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { apiFetch } from '../../src/lib/api';
import { AppColors, AppSpacing } from '../../src/styles/AppStyles';

type Product = {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  currentStock?: number;
  imageUrl?: string;
  imageFile?: any;
  description?: string;
  isActive?: boolean;
};

const sampleProducts: Product[] = [
  {
    id: 'p1',
    productId: 'af-p-1',
    name: 'Jollof Spice Mix',
    price: 12,
    currentStock: 20,
    description: 'Signature peppers + spices',
    isActive: true,
  },
  {
    id: 'p2',
    productId: 'tu-p-1',
    name: 'Espresso Beans 500g',
    price: 16,
    currentStock: 25,
    description: 'Single origin, medium roast',
    isActive: true,
  },
  {
    id: 'p3',
    productId: 'gr-p-1',
    name: 'Veggie Box',
    price: 20,
    currentStock: 15,
    description: 'Seasonal greens bundle',
    isActive: false,
  },
];

export default function StoreConsole() {
  const { token, user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isEntity = user?.userType === 'entity';

  const pickImage = async () => {
    try {
      setUploadingImage(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to attach product pictures.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      setForm((prev) => ({ ...prev, imageUrl: asset.uri, imageFile: asset }));
    } catch (e: any) {
      Alert.alert('Image error', e.message || 'Could not pick image');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      if (!token) {
        setProducts(sampleProducts);
        return;
      }
      const data = await apiFetch(`${API_BASE}/products?mine=true`);
      const list: Product[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setProducts(list.length === 0 ? sampleProducts : list);
    } catch (e) {
      console.warn('fetchProducts fallback:', e);
      setProducts(sampleProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const resetForm = () => {
    setForm({});
    setEditingId(undefined);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id || p.productId);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      imageFile: undefined,
      isActive: p.isActive ?? true,
    });
  };

  const submitProduct = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Validation', 'Product name is required');
      return;
    }
    if (!form.price || form.price <= 0) {
      Alert.alert('Validation', 'Price must be greater than zero');
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description?.trim() || null,
      imageUrl: form.imageUrl?.trim() || null,
      isActive: form.isActive ?? true,
      currentStock: form.currentStock ?? 0,
    };

    setSaving(true);
    try {
      if (!token) {
        // demo mode
        if (editingId) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingId || p.productId === editingId ? { ...p, ...payload } : p
            )
          );
        } else {
          setProducts((prev) => [{ ...payload, id: `sample-${Date.now()}` }, ...prev]);
        }
        resetForm();
        Alert.alert('Saved (demo)', 'Product updated locally. Connect API for live data.');
        return;
      }

      if (form.imageFile?.uri) {
        const body = new FormData();
        body.append('file', {
          uri: form.imageFile.uri,
          name: form.imageFile.fileName || 'product.jpg',
          type: form.imageFile.mimeType || 'image/jpeg',
        } as any);
        const uploadResp = await fetch(`${API_BASE}/uploads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        if (uploadResp.ok) {
          const uploaded = await uploadResp.json().catch(() => null);
          payload.imageUrl = uploaded?.url || uploaded?.secure_url || payload.imageUrl;
        } else {
          Alert.alert('Upload failed', 'Image was not uploaded; saving product without it.');
        }
      }

      if (editingId) {
        await apiFetch(`${API_BASE}/products/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      await fetchProducts();
      resetForm();
      Alert.alert('Success', 'Product saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const productHeader = useMemo(() => (editingId ? 'Edit product' : 'New product'), [editingId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Store Console</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => {
            fetchProducts();
          }}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      {!isEntity ? (
        <Text style={{ color: '#b00020', marginBottom: 16 }}>
          Sign in as a business to manage products.
        </Text>
      ) : null}

      {/* PRODUCT FORM */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{productHeader}</Text>
          {editingId ? (
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.link}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TextInput
          placeholder="Name"
          value={form.name}
          onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Price"
          keyboardType="decimal-pad"
          value={form.price?.toString() || ''}
          onChangeText={(t) => setForm((p) => ({ ...p, price: Number(t) || 0 }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Image URL"
          value={form.imageUrl}
          onChangeText={(t) => setForm((p) => ({ ...p, imageUrl: t }))}
          style={styles.input}
        />
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.uploadBtn, uploadingImage && { opacity: 0.7 }]}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Text style={styles.uploadText}>
              {uploadingImage ? 'Opening gallery...' : 'Pick image'}
            </Text>
          </TouchableOpacity>
          {form.imageUrl ? <Image source={{ uri: form.imageUrl }} style={styles.preview} /> : null}
        </View>
        <TextInput
          placeholder="Description"
          value={form.description}
          onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
          style={[styles.input, { height: 80 }]}
          multiline
        />
        <TouchableOpacity
          style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
          onPress={submitProduct}
          disabled={saving}
        >
          <Text style={styles.primaryText}>
            {saving ? 'Saving...' : editingId ? 'Update product' : 'Create product'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCTS LIST */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products for customers</Text>
          {loadingProducts ? <ActivityIndicator color={AppColors.secondary} /> : null}
        </View>
        {products.map((p) => (
          <View key={p.id || p.productId || p.name} style={styles.listRow}>
            {p.imageUrl ? <Image source={{ uri: p.imageUrl }} style={styles.preview} /> : null}
            <View style={{ flex: 1, marginLeft: p.imageUrl ? 10 : 0 }}>
              <Text style={styles.itemTitle}>{p.name}</Text>
              <Text style={styles.meta}>${p.price?.toFixed(2) || '0.00'}</Text>
              {p.description ? <Text style={styles.meta}>{p.description}</Text> : null}
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => startEdit(p)}>
              <Text style={styles.link}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
        {products.length === 0 && !loadingProducts ? (
          <Text style={{ color: '#666' }}>No products yet. Add your first one above.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: AppSpacing.medium,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refreshBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.secondary,
  },
  refreshText: { color: AppColors.secondary, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    color: '#222',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primaryBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  meta: { color: '#666', marginTop: 2, maxWidth: 240 },
  linkBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  link: { color: AppColors.secondary, fontWeight: '700' },
  uploadBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.secondary,
    backgroundColor: '#fff',
  },
  uploadText: { color: AppColors.secondary, fontWeight: '700' },
  preview: { width: 70, height: 70, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
});
