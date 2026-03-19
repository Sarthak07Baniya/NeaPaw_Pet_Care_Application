import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { shoppingService } from '../../services/shoppingService';

const normalizeCartItem = (item) => {
  if (!item) return item;

  const product = item.product || item.product_details || null;
  const productId = product?.id || item.product_id || item.product || null;

  return {
    ...item,
    product,
    productId,
  };
};

const normalizeCartPayload = (payload) => ({
  ...payload,
  items: Array.isArray(payload?.items)
    ? payload.items.map(normalizeCartItem).filter(Boolean)
    : [],
  total: payload?.total || 0,
});

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await shoppingService.getCart();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await shoppingService.addToCart(productId, quantity);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await shoppingService.updateCartItem(itemId, quantity);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      return await shoppingService.removeFromCart(itemId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const normalized = normalizeCartPayload(action.payload);
        state.items = normalized.items;
        state.total = normalized.total;
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const normalized = normalizeCartPayload(action.payload);
        state.items = normalized.items;
        state.total = normalized.total;
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const normalized = normalizeCartPayload(action.payload);
        state.items = normalized.items;
        state.total = normalized.total;
        state.loading = false;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const normalized = normalizeCartPayload(action.payload);
        state.items = normalized.items;
        state.total = normalized.total;
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => state.cart.total;
export const selectCartLoading = (state) => state.cart.loading;

export default cartSlice.reducer;
