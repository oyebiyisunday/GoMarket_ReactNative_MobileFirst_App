import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE } from '../lib/config';

interface Store {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  storeId: string;
  category: string;
  description?: string;
}

interface CatalogState {
  stores: Store[];
  products: Product[];
  selectedStore: Store | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  stores: [],
  products: [],
  selectedStore: null,
  isLoading: false,
  error: null,
};

// Fetch stores
export const fetchStores = createAsyncThunk(
  'catalog/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/stores`);
      if (!response.ok) throw new Error('Failed to fetch stores');
      const data = await response.json();
      const stores = Array.isArray(data) ? data : (data as any)?.stores ?? [];
      return stores as Store[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch stores');
    }
  }
);

// Fetch products by store
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (storeId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/stores/${storeId}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      const products = Array.isArray(data) ? data : (data as any)?.products ?? (data as any)?.items ?? [];
      return products as Product[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'catalog/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search products');
      const data = await response.json();
      const products = Array.isArray(data) ? data : (data as any)?.products ?? (data as any)?.items ?? [];
      return products as Product[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stores
      .addCase(fetchStores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedStore, clearProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
