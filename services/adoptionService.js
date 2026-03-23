import api from "./api";

export const adoptionService = {
  getPets: async () => {
    try {
      const response = await api.get('adoption/pets/');
      return response.data;
    } catch (error) {
      console.error("Get adoption pets error:", error);
      throw error;
    }
  },

  getPet: async (petId) => {
    try {
      const response = await api.get(`adoption/pets/${petId}/`);
      return response.data;
    } catch (error) {
      console.error("Get adoption pet error:", error);
      throw error;
    }
  },

  getApplications: async () => {
    try {
      const response = await api.get('adoption/applications/');
      return response.data;
    } catch (error) {
      console.error("Get adoption applications error:", error);
      throw error;
    }
  },

  submitApplication: async (applicationData) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && applicationData instanceof FormData;
      const response = await api.post(
        'adoption/applications/',
        applicationData,
        isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      );
      return response.data;
    } catch (error) {
      console.error("Submit adoption application error:", error);
      throw error;
    }
  },

  addReview: async (applicationId, reviewData) => {
    try {
      const response = await api.post(`adoption/applications/${applicationId}/review/`, reviewData);
      return response.data;
    } catch (error) {
      console.error("Create adoption review error:", error);
      throw error;
    }
  },

  getChatMessages: async (applicationId) => {
    try {
      const response = await api.get(`adoption/applications/${applicationId}/chat/`);
      return response.data;
    } catch (error) {
      console.error("Get adoption chat messages error:", error);
      throw error;
    }
  },

  sendChatMessage: async (applicationId, message) => {
    try {
      const response = await api.post(`adoption/applications/${applicationId}/chat/`, { message });
      return response.data;
    } catch (error) {
      console.error("Send adoption chat message error:", error);
      throw error;
    }
  }
};
