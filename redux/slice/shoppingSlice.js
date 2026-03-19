import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { shoppingService } from '../../services/shoppingService';

export const fetchProducts = createAsyncThunk(
  'shopping/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await shoppingService.getProducts(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOffers = createAsyncThunk(
  'shopping/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      return await shoppingService.getOffers();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'shopping/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return await shoppingService.getProductReviews(productId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  products: [],
  offers: [],
  searchQuery: '',
  selectedCategory: 'All',
  sortOption: 'popular',
  productReviews: [],
  appliedCoupon: null,
  loading: false,
  error: null,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    resetShoppingFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'All';
      state.sortOption = 'popular';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.results || action.payload;
        state.products = Array.isArray(data) ? data : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Offers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.results || action.payload;
        state.offers = Array.isArray(data) ? data : [];
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product Reviews
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviews = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSortOption,
  applyCoupon,
  removeCoupon,
  resetShoppingFilters,
} = shoppingSlice.actions;

// Selectors
export const selectProducts = (state) => state.shopping.products;
export const selectOffers = (state) => state.shopping.offers;
export const selectSearchQuery = (state) => state.shopping.searchQuery;
export const selectSelectedCategory = (state) => state.shopping.selectedCategory;
export const selectSortOption = (state) => state.shopping.sortOption;
export const selectAppliedCoupon = (state) => state.shopping.appliedCoupon;
export const selectShoppingLoading = (state) => state.shopping.loading;

export default shoppingSlice.reducer;
