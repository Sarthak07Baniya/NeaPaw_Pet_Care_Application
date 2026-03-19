import { configureStore } from "@reduxjs/toolkit";
import adoptionSlice from "./slice/adoptionSlice";
import authSlice from "./slice/authSlice";
import cartSlice from "./slice/cartSlice";
import hostelSlice from "./slice/hostelSlice";
import myPetSlice from "./slice/myPetSlice";
import ordersSlice from "./slice/ordersSlice";
import shoppingSlice from "./slice/shoppingSlice";
import treatmentSlice from "./slice/treatmentSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    myPet: myPetSlice,
    cart: cartSlice,
    shopping: shoppingSlice,
    treatment: treatmentSlice,
    hostel: hostelSlice,
    orders: ordersSlice,
    adoption: adoptionSlice,
  },
});
