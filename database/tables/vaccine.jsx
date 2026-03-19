// Mock implementation of vaccine database (replaces SQLite)

let mockVaccine = [];
let nextVaccineId = 1;

export const getAllVaccinebyPetId = (petId) => {
  const filtered = mockVaccine.filter(vaccine => vaccine.petId === +petId);
  return Promise.resolve(filtered);
};

export const addAVaccine = (vaccine) => {
  const newVaccine = {
    ...vaccine,
    id: nextVaccineId++,
  };
  mockVaccine.push(newVaccine);
  return Promise.resolve(newVaccine.id);
};

export const deleteVaccine = (id) => {
  mockVaccine = mockVaccine.filter(vaccine => vaccine.id !== +id);
  return Promise.resolve();
};
