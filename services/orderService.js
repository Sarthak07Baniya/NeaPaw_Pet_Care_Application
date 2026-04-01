import api from "./api";
import { adoptionService } from "./adoptionService";

const normalizeChatTarget = (target) => {
  if (typeof target === 'object' && target !== null) {
    return {
      orderId: target.orderId ?? target.id,
      orderType: target.orderType ?? target.type ?? 'shopping',
    };
  }

  return {
    orderId: target,
    orderType: 'shopping',
  };
};

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

  getChatMessages: async (target) => {
    try {
      const { orderId, orderType } = normalizeChatTarget(target);
      if (orderType === 'adoption') {
        return adoptionService.getChatMessages(String(orderId).replace('adoption-', ''));
      }
      const response = await api.get(`orders/list/${orderId}/chat/`);
      return response.data;
    } catch (error) {
      console.error("Get chat messages error:", error);
      throw error;
    }
  },

  sendChatMessage: async (target, message) => {
    try {
      const { orderId, orderType } = normalizeChatTarget(target);
      if (orderType === 'adoption') {
        return adoptionService.sendChatMessage(String(orderId).replace('adoption-', ''), message);
      }
      const response = await api.post(`orders/list/${orderId}/chat/`, { message });
      return response.data;
    } catch (error) {
      console.error("Send chat message error:", error);
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
