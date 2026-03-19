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
      const response = await api.post('adoption/applications/', applicationData);
      return response.data;
    } catch (error) {
      console.error("Submit adoption application error:", error);
      throw error;
    }
  }
};
