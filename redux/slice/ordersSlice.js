import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createOrderAsync = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const trackOrderAsync = createAsyncThunk(
  'orders/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.trackOrder(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  orders: [],
  selectedFilter: 'all',
  trackingInfo: null,
  chatMessagesByOrder: {},
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderFilter: (state, action) => {
      state.selectedFilter = action.payload;
    },
    addChatMessage: (state, action) => {
      const { orderId, message } = action.payload;

      if (!orderId || !message) return;

      const currentMessages = state.chatMessagesByOrder[orderId] || [];
      currentMessages.push({
        id: Date.now(),
        sender: 'user',
        message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      state.chatMessagesByOrder[orderId] = currentMessages;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.results || action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(trackOrderAsync.fulfilled, (state, action) => {
        state.trackingInfo = action.payload;
      });
  },
});

export const { setOrderFilter, addChatMessage } = ordersSlice.actions;

export const selectAllOrders = (state) => state.orders.orders;
export const selectOrderFilter = (state) => state.orders.selectedFilter;
export const selectChatMessages = (orderId) => (state) =>
  state.orders.chatMessagesByOrder[orderId] || [];
export const selectFilteredOrders = createSelector(
  [selectAllOrders, selectOrderFilter],
  (orders, selectedFilter) => {
    if (selectedFilter === 'all') return orders;
    return orders.filter(
      (order) => order.order_type?.toLowerCase() === selectedFilter.toLowerCase()
    );
  }
);

export default ordersSlice.reducer;
