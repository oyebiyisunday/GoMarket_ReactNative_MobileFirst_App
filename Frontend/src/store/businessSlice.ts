import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE } from '../lib/config';

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}

interface BusinessState {
  currentBusiness: any | null;
  salesData: SalesData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  currentBusiness: null,
  salesData: null,
  isLoading: false,
  error: null,
};

// Fetch business dashboard data
export const fetchBusinessData = createAsyncThunk(
  'business/fetchBusinessData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/business/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch business data');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch business data');
    }
  }
);

// Fetch sales analytics
export const fetchSalesData = createAsyncThunk(
  'business/fetchSalesData',
  async (dateRange: { start: string; end: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/business/sales?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (!response.ok) throw new Error('Failed to fetch sales data');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sales data');
    }
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBusiness: (state, action) => {
      state.currentBusiness = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch business data
      .addCase(fetchBusinessData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusiness = action.payload;
      })
      .addCase(fetchBusinessData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch sales data
      .addCase(fetchSalesData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesData = action.payload;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentBusiness } = businessSlice.actions;
export default businessSlice.reducer;
