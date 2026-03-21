import api from "./api";

export const shoppingService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('shopping/products/', { params });
      return response.data;
    } catch (error) {
      console.error("Get products error:", error);
      throw error;
    }
  },

  getProduct: async (productId) => {
    try {
      const response = await api.get(`shopping/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error("Get product error:", error);
      throw error;
    }
  },

  getOffers: async () => {
    try {
      const response = await api.get('shopping/offers/');
      return response.data;
    } catch (error) {
      console.error("Get offers error:", error);
      throw error;
    }
  },

  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`shopping/products/${productId}/reviews/`);
      return response.data;
    } catch (error) {
      console.error("Get product reviews error:", error);
      throw error;
    }
  },

  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`shopping/products/${productId}/reviews/`, reviewData);
      return response.data;
    } catch (error) {
      console.error("Add product review error:", error);
      throw error;
    }
  },

  getCart: async () => {
    try {
      const response = await api.get('shopping/cart/');
      return response.data;
    } catch (error) {
      console.error("Get cart error:", error);
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post('shopping/cart/items/', {
        product_id: productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.post('shopping/cart/update/', {
        item_id: itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error("Update cart item error:", error);
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await api.post('shopping/cart/remove/', {
        item_id: itemId
      });
      return response.data;
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await api.post('shopping/cart/apply-coupon/', { code });
      return response.data;
    } catch (error) {
      console.error("Apply coupon error:", error);
      throw error;
    }
  },

  getCoupons: async () => {
    try {
      const response = await api.get('shopping/coupons/');
      return response.data;
    } catch (error) {
      console.error("Get coupons error:", error);
      throw error;
    }
  }
};
