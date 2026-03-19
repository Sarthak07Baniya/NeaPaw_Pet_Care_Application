// Mock implementation of vet database (replaces SQLite)

let mockVet = [];
let nextVetId = 1;

export const getAllVetbyPetId = (petId) => {
  const filtered = mockVet.filter(vet => vet.petId === +petId);
  return Promise.resolve(filtered);
};

export const addVet = (vet) => {
  const newVet = {
    ...vet,
    id: nextVetId++,
  };
  mockVet.push(newVet);
  return Promise.resolve(newVet.id);
};

export const deleteVet = (id) => {
  mockVet = mockVet.filter(vet => vet.id !== +id);
  return Promise.resolve();
};
