import api from "./api";

export const profileService = {
  getSavedCards: async () => {
    const response = await api.get("profiles/cards/");
    return response.data;
  },

  addSavedCard: async (data) => {
    const response = await api.post("profiles/cards/", data);
    return response.data;
  },

  deleteSavedCard: async (id) => {
    await api.delete(`profiles/cards/${id}/`);
    return true;
  },
};
