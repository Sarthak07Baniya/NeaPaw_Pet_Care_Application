// Mock implementation of weight database (replaces SQLite)

let mockWeight = [];
let nextWeightId = 1;

export const getAllWeightbyPetId = (petId) => {
  const filtered = mockWeight.filter(weight => weight.petId === +petId);
  return Promise.resolve(filtered);
};

export const addWeight = (weight) => {
  const newWeight = {
    ...weight,
    id: nextWeightId++,
  };
  mockWeight.push(newWeight);
  return Promise.resolve(newWeight.id);
};

export const deleteWeight = (id) => {
  mockWeight = mockWeight.filter(weight => weight.id !== +id);
  return Promise.resolve();
};

export const getAllWeightForADate = (petId, date) => {
  const filtered = mockWeight.filter(
    weight => weight.petId === +petId && weight.date === date
  );
  return Promise.resolve(filtered);
};
