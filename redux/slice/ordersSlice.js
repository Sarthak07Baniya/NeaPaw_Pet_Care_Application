import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

const getChatStateKey = ({ orderId, orderType }) =>
  orderType === 'adoption' ? `adoption-${String(orderId).replace('adoption-', '')}` : String(orderId);

const normalizeChatPayload = (payload) =>
  typeof payload === 'object' && payload !== null
    ? {
        orderId: payload.orderId ?? payload.id,
        orderType: payload.orderType ?? payload.type ?? 'shopping',
        message: payload.message,
      }
    : {
        orderId: payload,
        orderType: 'shopping',
        message: undefined,
      };

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

export const fetchChatMessages = createAsyncThunk(
  'orders/fetchChatMessages',
  async (payload, { rejectWithValue }) => {
    try {
      const { orderId, orderType } = normalizeChatPayload(payload);
      const stateKey = getChatStateKey({ orderId, orderType });
      return {
        orderId: stateKey,
        messages: await orderService.getChatMessages({ orderId, orderType }),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendChatMessageAsync = createAsyncThunk(
  'orders/sendChatMessage',
  async (payload, { rejectWithValue }) => {
    try {
      const { orderId, orderType, message } = normalizeChatPayload(payload);
      const stateKey = getChatStateKey({ orderId, orderType });
      return {
        orderId: stateKey,
        message: await orderService.sendChatMessage({ orderId, orderType }, message),
      };
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
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { orderId, messages } = action.payload;
        state.chatMessagesByOrder[orderId] = Array.isArray(messages) ? messages : [];
      })
      .addCase(sendChatMessageAsync.fulfilled, (state, action) => {
        const { orderId, message } = action.payload;
        const currentMessages = state.chatMessagesByOrder[orderId] || [];
        currentMessages.push(message);
        state.chatMessagesByOrder[orderId] = currentMessages;
      });
  },
});

export const { setOrderFilter } = ordersSlice.actions;

export const selectAllOrders = (state) => state.orders.orders;
export const selectOrderFilter = (state) => state.orders.selectedFilter;
export const selectChatMessages = (orderId, orderType = 'shopping') => (state) =>
  state.orders.chatMessagesByOrder[getChatStateKey({ orderId, orderType })] || [];
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
