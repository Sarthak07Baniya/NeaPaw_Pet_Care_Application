import api from "./api";

export const hostelService = {
  getBookings: async () => {
    try {
      const response = await api.get('hostel/bookings/');
      return response.data;
    } catch (error) {
      console.error("Get hostel bookings error:", error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await api.post('hostel/bookings/', bookingData);
      return response.data;
    } catch (error) {
      console.error("Create hostel booking error:", error);
      throw error;
    }
  },

  getRooms: async () => {
    try {
      const response = await api.get('hostel/rooms/');
      return response.data;
    } catch (error) {
      console.error("Get hostel rooms error:", error);
      throw error;
    }
  },

  checkAvailability: async (checkIn, checkOut) => {
    try {
      const response = await api.get('hostel/bookings/availability/', {
        params: { check_in: checkIn, check_out: checkOut }
      });
      return response.data;
    } catch (error) {
      console.error("Check availability error:", error);
      throw error;
    }
  }
};
