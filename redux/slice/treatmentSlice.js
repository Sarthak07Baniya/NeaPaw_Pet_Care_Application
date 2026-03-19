import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { treatmentService } from '../../services/treatmentService';

export const fetchTreatmentTypes = createAsyncThunk(
  'treatment/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await treatmentService.getTreatmentTypes();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTreatmentCategories = createAsyncThunk(
  'treatment/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await treatmentService.getTreatmentTypes();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTreatmentBookings = createAsyncThunk(
  'treatment/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      return await treatmentService.getBookings();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTreatmentBooking = createAsyncThunk(
  'treatment/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      return await treatmentService.createBooking(bookingData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  treatmentCategories: [],
  treatmentTypes: [],
  bookings: [],
  selectedPet: null,
  selectedTreatmentType: null,
  selectedService: null,
  selectedServiceType: null, // pickup or store
  selectedDate: null,
  selectedTime: null,
  loading: false,
  error: null,
};

const treatmentSlice = createSlice({
  name: 'treatment',
  initialState,
  reducers: {
    setSelectedPet: (state, action) => {
      state.selectedPet = action.payload;
    },
    setSelectedTreatmentType: (state, action) => {
      state.selectedTreatmentType = action.payload;
      state.selectedService = null;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setSelectedServiceType: (state, action) => {
      state.selectedServiceType = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
    resetTreatmentSelection: (state) => {
      state.selectedPet = null;
      state.selectedTreatmentType = null;
      state.selectedService = null;
      state.selectedServiceType = null;
      state.selectedDate = null;
      state.selectedTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatmentTypes.fulfilled, (state, action) => {
        const data = action.payload?.results || action.payload;
        state.treatmentTypes = Array.isArray(data) ? data : [];
      })
      .addCase(fetchTreatmentCategories.fulfilled, (state, action) => {
        const data = action.payload?.results || action.payload;
        state.treatmentCategories = Array.isArray(data) ? data : [];
      })
      .addCase(fetchTreatmentBookings.fulfilled, (state, action) => {
        const data = action.payload?.results || action.payload;
        state.bookings = Array.isArray(data) ? data : [];
      })
      .addCase(createTreatmentBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTreatmentBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createTreatmentBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedPet,
  setSelectedTreatmentType,
  setSelectedService,
  setSelectedServiceType,
  setSelectedDate,
  setSelectedTime,
  resetTreatmentSelection,
} = treatmentSlice.actions;

export const selectTreatmentTypes = (state) => state.treatment.treatmentTypes;
export const selectTreatmentBookings = (state) => state.treatment.bookings;
export const selectSelectedPet = (state) => state.treatment.selectedPet;
export const selectSelectedTreatmentType = (state) => state.treatment.selectedTreatmentType;
export const selectSelectedServiceType = (state) => state.treatment.selectedServiceType;
export const selectSelectedDate = (state) => state.treatment.selectedDate;
export const selectSelectedTime = (state) => state.treatment.selectedTime;

export default treatmentSlice.reducer;
