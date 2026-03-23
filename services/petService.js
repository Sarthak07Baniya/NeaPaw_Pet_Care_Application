import api from "./api";
import { addWeight, deleteWeight, getAllWeightbyPetId } from "../database/tables/weight";
import { addAVaccine, deleteVaccine as deleteLocalVaccine, getAllVaccinebyPetId } from "../database/tables/vaccine";

export const petService = {
  getPets: async () => {
    try {
      const response = await api.get('pets/');
      return response.data;
    } catch (error) {
      console.error("Get pets error:", error);
      throw error;
    }
  },

  addPet: async (petData) => {
    try {
      // Handle image upload if present
      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        if (key === 'photo' && petData[key]) {
          formData.append('photo', {
            uri: petData[key],
            type: 'image/jpeg',
            name: 'pet_photo.jpg',
          });
        } else {
          formData.append(key, petData[key]);
        }
      });

      const response = await api.post('pets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Add pet error:", error);
      throw error;
    }
  },

  updatePet: async (id, petData) => {
    try {
      const response = await api.patch(`pets/${id}/`, petData);
      return response.data;
    } catch (error) {
      console.error("Update pet error:", error);
      throw error;
    }
  },

  deletePet: async (id) => {
    try {
      await api.delete(`pets/${id}/`);
      return true;
    } catch (error) {
      console.error("Delete pet error:", error);
      throw error;
    }
  },

  // Vet Visits
  addVetVisit: async (visitData) => {
    try {
      const response = await api.post('pets/visits/', visitData);
      return response.data;
    } catch (error) {
      console.error("Add vet visit error:", error);
      throw error;
    }
  },

  getVetVisits: async () => {
    try {
      const response = await api.get('pets/visits/');
      return response.data;
    } catch (error) {
      console.error("Get vet visits error:", error);
      throw error;
    }
  },

  deleteVetVisit: async (id) => {
    try {
      await api.delete(`pets/visits/${id}/`);
      return true;
    } catch (error) {
      console.error("Delete vet visit error:", error);
      throw error;
    }
  },

  // Weight Logs
  addWeightLog: async (weightData) => {
    try {
      const localWeight = {
        petId: weightData.petId ?? weightData.pet,
        weight: weightData.weight,
        date: weightData.date,
      };
      const id = await addWeight(localWeight);
      return { ...localWeight, id };
    } catch (error) {
      console.error("Add weight log error:", error);
      throw error;
    }
  },

  getWeightHistory: async (petId) => {
    try {
      return await getAllWeightbyPetId(petId);
    } catch (error) {
      console.error("Get weight history error:", error);
      throw error;
    }
  },

  deleteWeightLog: async (id) => {
    try {
      await deleteWeight(id);
      return true;
    } catch (error) {
      console.error("Delete weight log error:", error);
      throw error;
    }
  },

  addVaccine: async (vaccineData) => {
    const localVaccine = {
      petId: vaccineData.petId ?? vaccineData.pet,
      name: vaccineData.name,
      date: vaccineData.date,
      note: vaccineData.note,
    };
    const id = await addAVaccine(localVaccine);
    return { ...localVaccine, id };
  },

  getVaccines: async (petId) => {
    return await getAllVaccinebyPetId(petId);
  },

  deleteVaccine: async (id) => {
    await deleteLocalVaccine(id);
    return true;
  },

  // Medical Records
  addMedicalRecord: async (medicalData) => {
    try {
      const response = await api.post('pets/medical/', medicalData);
      return response.data;
    } catch (error) {
      console.error("Add medical record error:", error);
      throw error;
    }
  },

  getMedicalRecords: async () => {
    try {
      const response = await api.get('pets/medical/');
      return response.data;
    } catch (error) {
      console.error("Get medical records error:", error);
      throw error;
    }
  },

  deleteMedicalRecord: async (id) => {
    try {
      await api.delete(`pets/medical/${id}/`);
      return true;
    } catch (error) {
      console.error("Delete medical record error:", error);
      throw error;
    }
  }
};
