import api from "./api";

export const treatmentService = {
  getTreatmentTypes: async () => {
    try {
      const response = await api.get('treatment/types/');
      return response.data;
    } catch (error) {
      console.error("Get treatment types error:", error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('treatment/types/');
      return response.data;
    } catch (error) {
      console.error("Get treatment categories error:", error);
      throw error;
    }
  },

  getBookings: async () => {
    try {
      const response = await api.get('treatment/bookings/');
      return response.data;
    } catch (error) {
      console.error("Get treatment bookings error:", error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await api.post('treatment/bookings/', bookingData);
      return response.data;
    } catch (error) {
      console.error("Create treatment booking error:", error);
      throw error;
    }
  },
  
  cancelBooking: async (id) => {
    try {
      const response = await api.post(`treatment/bookings/${id}/cancel/`);
      return response.data;
    } catch (error) {
      console.error("Cancel treatment booking error:", error);
      throw error;
    }
  }
};
