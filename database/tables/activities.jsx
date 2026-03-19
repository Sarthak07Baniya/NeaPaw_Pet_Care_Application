// Mock implementation of activities database (replaces SQLite)

let mockActivities = [];
let nextActivityId = 1;

export const getActivitiesForADate = (petId, date) => {
  const filtered = mockActivities.filter(
    activity => activity.petId === +petId && activity.date === date
  );
  return Promise.resolve(filtered);
};

export const addAnActivity = (activity) => {
  const newActivity = {
    ...activity,
    id: nextActivityId++,
  };
  mockActivities.push(newActivity);
  return Promise.resolve(newActivity.id);
};

export const deleteActivity = (id) => {
  mockActivities = mockActivities.filter(activity => activity.id !== +id);
  return Promise.resolve();
};

export const updateActivity = (activity) => {
  const index = mockActivities.findIndex(a => a.id === activity.id);
  if (index !== -1) {
    mockActivities[index] = activity;
  }
  return Promise.resolve();
};

export const getAllActivities = (petId) => {
  const filtered = mockActivities.filter(activity => activity.petId === +petId);
  return Promise.resolve(filtered);
};

export const getVetVaccinationByPetiD = (petId, date) => {
  // Mock implementation - returning empty list or some mock data
  // This seems to aggregate vet and vaccine data, but for mock we can just return empty for now
  // or return some mock events if needed
  return Promise.resolve([]);
};
