import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { hostelService } from '../../services/hostelService';

export const fetchHostelBookings = createAsyncThunk(
  'hostel/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      return await hostelService.getBookings();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHostelRooms = createAsyncThunk(
  'hostel/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await hostelService.getRooms();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createHostelBooking = createAsyncThunk(
  'hostel/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      return await hostelService.createBooking(bookingData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'hostel/checkAvailability',
  async ({ checkIn, checkOut }, { rejectWithValue }) => {
    try {
      return await hostelService.checkAvailability(checkIn, checkOut);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  bookings: [],
  rooms: [],
  selectedPet: null,
  selectedRoom: null,
  checkInDate: null,
  checkOutDate: null,
  selectedServiceType: null,
  additionalTreatments: [],
  petDetails: {
    allergies: '',
    diet: '',
    nature: '',
    vaccinated: false,
    communicableDisease: false,
  },
  availability: null,
  loading: false,
  error: null,
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    setSelectedPet: (state, action) => {
      state.selectedPet = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setCheckInDate: (state, action) => {
      state.checkInDate = action.payload;
    },
    setCheckOutDate: (state, action) => {
      state.checkOutDate = action.payload;
    },
    setSelectedServiceType: (state, action) => {
      state.selectedServiceType = action.payload;
    },
    toggleAdditionalTreatment: (state, action) => {
      const treatment = action.payload;
      const index = state.additionalTreatments.findIndex(t => t.id === treatment.id);
      if (index >= 0) {
        state.additionalTreatments.splice(index, 1);
      } else {
        state.additionalTreatments.push(treatment);
      }
    },
    setPetDetails: (state, action) => {
      state.petDetails = { ...state.petDetails, ...action.payload };
    },
    resetHostelSelection: (state) => {
      state.selectedPet = null;
      state.selectedRoom = null;
      state.checkInDate = null;
      state.checkOutDate = null;
      state.selectedServiceType = null;
      state.additionalTreatments = [];
      state.petDetails = {
        allergies: '',
        diet: '',
        nature: '',
        vaccinated: false,
        communicableDisease: false,
      };
      state.availability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostelBookings.fulfilled, (state, action) => {
        const data = action.payload.results || action.payload;
        state.bookings = Array.isArray(data) ? data : [];
      })
      .addCase(fetchHostelRooms.fulfilled, (state, action) => {
        const data = action.payload.results || action.payload;
        state.rooms = Array.isArray(data) ? data : [];
      })
      .addCase(createHostelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createHostelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createHostelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      });
  },
});

export const {
  setSelectedPet,
  setSelectedRoom,
  setCheckInDate,
  setCheckOutDate,
  setSelectedServiceType,
  toggleAdditionalTreatment,
  setPetDetails,
  resetHostelSelection,
} = hostelSlice.actions;

export default hostelSlice.reducer;
