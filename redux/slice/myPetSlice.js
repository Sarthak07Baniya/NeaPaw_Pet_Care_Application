import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { petService } from "../../services/petService";

export const fetchPets = createAsyncThunk(
  "myPet/fetchPets",
  async (_, { rejectWithValue }) => {
    try {
      return await petService.getPets();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPetAsync = createAsyncThunk(
  "myPet/addPet",
  async (petData, { rejectWithValue }) => {
    try {
      return await petService.addPet(petData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePetAsync = createAsyncThunk(
  "myPet/updatePet",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await petService.updatePet(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePetAsync = createAsyncThunk(
  "myPet/deletePet",
  async (id, { rejectWithValue }) => {
    try {
      await petService.deletePet(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  myPets: [],
  currentPetId: null,
  currentPetInfo: {
    id: "",
    name: "",
    photoURL: "",
    spicie: "",
    birthDate: "",
    breed: "",
    gender: "",
    weight: "",
    ownerName: "",
  },
  loading: false,
  error: null,
  calender: {
    selectedDate: "",
  },
};

const myPetSlice = createSlice({
  name: "myPet",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.currentPetInfo = {
        ...state.currentPetInfo,
        ...action.payload.data,
        ownerName:
          action.payload.data?.ownerName ??
          action.payload.data?.owner_name ??
          state.currentPetInfo.ownerName,
      };
      state.currentPetId = action.payload.id;
      state.currentPetInfo.id = action.payload.id;
    },
    setPetData(state, action) {
      state.currentPetInfo = {
        ...state.currentPetInfo,
        ...action.payload,
        ownerName:
          action.payload?.ownerName ??
          action.payload?.owner_name ??
          state.currentPetInfo.ownerName,
      };
      state.currentPetId = action.payload.id;
    },
    resetPetInfo(state) {
      state.currentPetInfo = { ...initialState.currentPetInfo };
      state.currentPetId = null;
    },
    resetEverything(state) {
      return initialState;
    },
    setSelectedDate: (state, action) => {
      state.calender.selectedDate = action.payload;
    },
    setPetSpicie: (state, action) => {
      state.currentPetInfo.spicie = action.payload;
    },
    setpetNameAndBirthDate: (state, action) => {
      state.currentPetInfo.name = action.payload.name;
      state.currentPetInfo.birthDate = action.payload.birthDate;
    },
    setPetImage: (state, action) => {
      state.currentPetInfo.photoURL = action.payload;
    },
    setGenderBreedWeight: (state, action) => {
      state.currentPetInfo.gender = action.payload.gender;
      state.currentPetInfo.breed = action.payload.breed;
      state.currentPetInfo.weight = action.payload.weight;
    },
    setOwnerName: (state, action) => {
      state.currentPetInfo.ownerName = action.payload;
    },
    fillPetInfo: (state, action) => {
      state.myPets = Array.isArray(action.payload)
        ? action.payload.map((pet) => ({ ...pet }))
        : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.results || action.payload;
        state.myPets = Array.isArray(data)
          ? data.map((pet) => ({ ...pet }))
          : [];
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPetAsync.fulfilled, (state, action) => {
        state.myPets.push({ ...action.payload });
        state.loading = false;
      })
      .addCase(deletePetAsync.fulfilled, (state, action) => {
        state.myPets = state.myPets.filter(pet => pet.id !== action.payload);
        state.loading = false;
      });
  },
});

export const {
  setId,
  setPetData,
  resetPetInfo,
  resetEverything,
  setSelectedDate,
  setPetSpicie,
  setpetNameAndBirthDate,
  setPetImage,
  setGenderBreedWeight,
  setOwnerName,
  fillPetInfo,
} = myPetSlice.actions;

export default myPetSlice.reducer;
