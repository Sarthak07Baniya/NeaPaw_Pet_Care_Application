import api from "./api";

export const orderService = {
  getOrders: async () => {
    try {
      const response = await api.get('orders/list/');
      return response.data;
    } catch (error) {
      console.error("Get orders error:", error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post('orders/list/', orderData);
      return response.data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  trackOrder: async (orderId) => {
    try {
      const response = await api.get(`orders/list/${orderId}/track/`);
      return response.data;
    } catch (error) {
      console.error("Track order error:", error);
      throw error;
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('orders/notifications/');
      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  },

  markNotificationRead: async (id) => {
    try {
      await api.post(`orders/notifications/${id}/mark_read/`);
      return true;
    } catch (error) {
      console.error("Mark notification read error:", error);
      throw error;
    }
  }
};
