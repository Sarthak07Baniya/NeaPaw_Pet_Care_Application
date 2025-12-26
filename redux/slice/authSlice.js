import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isInitialized = true;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.isInitialized = true;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    }
  },
});

export const { loginSuccess, logoutSuccess, setInitialized, updateUser } = authSlice.actions;

export default authSlice.reducer;
