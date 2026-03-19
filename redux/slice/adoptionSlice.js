import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { adoptionService } from '../../services/adoptionService';

export const fetchAdoptionPets = createAsyncThunk(
  'adoption/fetchPets',
  async (_, { rejectWithValue }) => {
    try {
      return await adoptionService.getPets();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitAdoptionApplication = createAsyncThunk(
  'adoption/submitApplication',
  async (applicationData, { rejectWithValue }) => {
    try {
      return await adoptionService.submitApplication(applicationData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAdoptionApplications = createAsyncThunk(
  'adoption/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      return await adoptionService.getApplications();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  pets: [],
  applications: [],
  loading: false,
  error: null,
};

const adoptionSlice = createSlice({
  name: 'adoption',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdoptionPets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdoptionPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload.results || action.payload;
      })
      .addCase(fetchAdoptionPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAdoptionApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAdoptionApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.push(action.payload);
      })
      .addCase(submitAdoptionApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdoptionApplications.fulfilled, (state, action) => {
        state.applications = action.payload.results || action.payload;
      });
  },
});

export const selectAdoptionPets = (state) => state.adoption.pets;
export const selectAdoptionApplications = (state) => state.adoption.applications;

export default adoptionSlice.reducer;
