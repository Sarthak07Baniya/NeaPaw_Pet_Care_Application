// Mock implementation of medical database (replaces SQLite)

let mockMedical = [];
let nextMedicalId = 1;

export const getAllMedicalbyPetId = (petId) => {
  const filtered = mockMedical.filter(medical => medical.petId === +petId);
  return Promise.resolve(filtered);
};

export const addAMedical = (medical) => {
  const newMedical = {
    ...medical,
    id: nextMedicalId++,
  };
  mockMedical.push(newMedical);
  return Promise.resolve(newMedical.id);
};

export const deleteMedical = (id) => {
  mockMedical = mockMedical.filter(medical => medical.id !== +id);
  return Promise.resolve();
};
