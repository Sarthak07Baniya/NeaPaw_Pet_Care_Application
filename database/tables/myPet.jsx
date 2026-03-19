// Mock implementation of pet database functions (replaces SQLite)

// In-memory storage
let mockPets = [
  {
    id: 1,
    name: 'Buddy',
    spicie: 'Dog',
    photoURL: '',
    birthDate: '2020-01-15',
    breed: 'Golden Retriever',
    gender: 'Male',
    weight: '30',
    ownerName: 'Pet Parent',
  },
];

let nextPetId = 2;

export const getMyPets = () => {
  return Promise.resolve([...mockPets]);
};

export const addAPet = (pet) => {
  const newPet = {
    ...pet,
    id: nextPetId++,
  };
  mockPets.push(newPet);
  return Promise.resolve(newPet.id);
};

export const deleteAPet = (id) => {
  mockPets = mockPets.filter(pet => pet.id !== +id);
  return Promise.resolve();
};
