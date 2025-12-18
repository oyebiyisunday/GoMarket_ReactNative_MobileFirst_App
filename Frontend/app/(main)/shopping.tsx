import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";
import { API_BASE } from "../../src/lib/config";
import { apiFetch } from "../../src/lib/api";
import { AppColors } from "../../src/styles/AppStyles";

interface Store {
  id: string;
  storeId: string;
  businessName: string;
  businessType: string;
  description: string;
  address: string;
  logoUrl: string;
  coverImageUrl: string;
  productCount: number;
  productKeywords?: string[];
}

const sampleStores: Store[] = [
  {
    id: "sample-tu",
    storeId: "tu-coffee",
    businessName: "TU Coffee",
    businessType: "Coffee",
    description: "Specialty beans and brews",
    address: "Baltimore",
    logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 12,
    productKeywords: ["espresso", "latte", "beans", "pastries"],
  },
  {
    id: "sample-af",
    storeId: "african-market",
    businessName: "African Market",
    businessType: "Market",
    description: "Pan-African pantry and produce",
    address: "Towson",
    logoUrl: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 18,
    productKeywords: ["spices", "grains", "produce"],
  },
  {
    id: "sample-da",
    storeId: "daily-cafe",
    businessName: "Daily Cafe",
    businessType: "Cafe",
    description: "Fresh brews and breakfast",
    address: "Columbia",
    logoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 9,
    productKeywords: ["coffee", "breakfast", "pastries"],
  },
  {
    id: "sample-go",
    storeId: "gotech-hub",
    businessName: "GoTech Hub",
    businessType: "Electronics",
    description: "Gadgets, laptops, accessories",
    address: "Silver Spring",
    logoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 16,
    productKeywords: ["laptop", "phone", "charger", "headphones"],
  },
  {
    id: "sample-gr",
    storeId: "green-basket",
    businessName: "Green Basket",
    businessType: "Groceries",
    description: "Organic veggies, fruits, staples",
    address: "Annapolis",
    logoUrl: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 14,
    productKeywords: ["vegetables", "fruit", "organic", "staples"],
  },
  {
    id: "sample-st",
    storeId: "style-loft",
    businessName: "Style Loft",
    businessType: "Fashion",
    description: "Denim, tees, and fits for the weekend",
    address: "Frederick",
    logoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    coverImageUrl: "",
    productCount: 11,
    productKeywords: ["jeans", "shirts", "outfits"],
  },
];

export default function ShoppingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const query = useLocalSearchParams<{ search?: string }>();

  const [searchQuery, setSearchQuery] = useState(query?.search || "");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      const apiStores =
        token
          ? await apiFetch(`${API_BASE}/catalog/stores?${params}`)
          : [];

      const apiList = Array.isArray(apiStores) ? apiStores : [];
      if (apiList.length > 0) {
        setStores(apiList);
        return;
      }

      // If no stores came back and we have a search term, try product search to derive stores
      if (token && searchQuery.trim()) {
        try {
          const products = await apiFetch(`${API_BASE}/catalog/products?search=${encodeURIComponent(searchQuery.trim())}`);
          if (Array.isArray(products) && products.length > 0) {
            const mapped: Store[] = [];
            const seen = new Set<string>();
            products.forEach((p: any) => {
              const sid = p.storeId || p.businessId || p.store_id;
              if (!sid || seen.has(sid)) return;
              seen.add(sid);
              mapped.push({
                id: sid,
                storeId: sid,
                businessName: p.storeName || p.businessName || "Store",
                businessType: p.category || p.type || "Store",
                description: p.description || "",
                address: p.address || "",
                logoUrl: p.storeLogo || "",
                coverImageUrl: "",
                productCount: Array.isArray(p.products) ? p.products.length : p.productCount || 0,
              });
            });
            if (mapped.length) {
              setStores(mapped);
              return;
            }
          }
        } catch (err) {
          // ignore product search failure
        }
      }

      // Fallback to demo filtering (includes product keywords)
      const term = searchQuery.trim().toLowerCase();
      setStores(
        term
          ? sampleStores.filter(
              (s) =>
                s.storeId.toLowerCase().includes(term) ||
                s.businessName.toLowerCase().includes(term) ||
                s.businessType.toLowerCase().includes(term) ||
                (s.description || "").toLowerCase().includes(term) ||
                (s.productKeywords || []).some((k) => k.toLowerCase().includes(term))
            )
          : sampleStores
      );
    } catch (error) {
      // Swallow API errors and fall back to demo data so LogBox doesn't red-screen
      console.warn("Load stores error, using sample data:", error);
      const term = searchQuery.trim().toLowerCase();
      setStores(
        term
          ? sampleStores.filter(
              (s) =>
                s.storeId.toLowerCase().includes(term) ||
                s.businessName.toLowerCase().includes(term) ||
                s.businessType.toLowerCase().includes(term) ||
                (s.description || "").toLowerCase().includes(term) ||
                (s.productKeywords || []).some((k) => k.toLowerCase().includes(term))
            )
          : sampleStores
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const q = (searchQuery || "").trim();
      if (!q) {
        await loadStores();
        return;
      }

      // Try direct storeId navigation first
      if (token) {
        try {
          await apiFetch(`${API_BASE}/catalog/stores/${encodeURIComponent(q)}/products`);
          router.push(`/(main)/store-catalog?storeId=${encodeURIComponent(q)}`);
          return;
        } catch (err) {
          // ignore
        }
      }

      // Fallback: search stores list
      await loadStores();
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const navigateToStore = (store: Store) => {
    router.push(`/(main)/store-catalog?storeId=${store.storeId}`);
  };

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity style={styles.storeCard} onPress={() => navigateToStore(item)}>
      <View style={styles.storeHeader}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.storeLogo} />
        ) : (
          <View style={[styles.storeLogo, styles.logoPlaceholder]}>
            <Text style={styles.iconText}>Store</Text>
          </View>
        )}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.businessName}</Text>
          <Text style={styles.storeType}>{item.businessType}</Text>
          <Text style={styles.productCount}>{item.productCount} products</Text>
        </View>
        <Text style={styles.iconText}>{">"}</Text>
      </View>

      {item.description ? (
        <Text style={styles.storeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      {item.address ? (
        <View style={styles.addressContainer}>
          <Text style={styles.iconText}>@</Text>
          <Text style={styles.address}>{item.address}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.viewBtn} onPress={() => navigateToStore(item)}>
        <Text style={styles.viewBtnText}>View items</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(main)")}>
          <Text style={[styles.iconText, { color: AppColors.secondary }]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stores</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.searchContainer}>
        <Text style={[styles.iconText, styles.searchIcon]}>Search</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={"Search by store, product name, or category..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.secondary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 8,
  },
  searchIcon: {
    marginLeft: 4,
  },
  iconText: {
    color: "#666",
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoPlaceholder: {
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#161616",
  },
  storeType: {
    fontSize: 13,
    color: "#666",
  },
  productCount: {
    fontSize: 12,
    color: "#888",
  },
  storeDescription: {
    fontSize: 13,
    color: "#6c6c6c",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  address: {
    fontSize: 12,
    color: "#666",
  },
  viewBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
