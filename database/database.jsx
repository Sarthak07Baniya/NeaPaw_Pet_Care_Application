// Mock database implementation (replaces expo-sqlite for web compatibility)

// In-memory storage for mock data
let mockPets = [];
let mockActivities = [];
let mockMedical = [];
let mockVaccine = [];
let mockVet = [];
let mockWeight = [];

// Mock database initialization
export const dbInit = () => {
  return Promise.resolve();
};

// Mock database drop
export const dropDatabase = () => {
  mockPets = [];
  mockActivities = [];
  mockMedical = [];
  mockVaccine = [];
  mockVet = [];
  mockWeight = [];
  return Promise.resolve();
};

// Export mock db object (not used but kept for compatibility)
export const db = {
  transaction: (callback) => {
    // Mock transaction - does nothing
    callback({
      executeSql: () => {},
    });
  },
};
