import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const CURRENT_USER_KEY = "neapaw_current_user";
const OWNER_NAME_KEY = "neapaw_owner_name";

export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('auth/register/', userData);
      const { user, tokens, message } = response.data;
      
      await AsyncStorage.setItem(TOKEN_KEY, tokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return { success: true, user, token: tokens.access, message: message || "Registration successful!" };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.email?.[0] || error.response?.data?.detail || "An error occurred during registration." 
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('auth/login/', { email, password });
      const { user, tokens } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, tokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { success: true, user, token: tokens.access };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      
      let message = "Invalid email or password.";
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (!error.response) {
        message = "Unable to connect to server. Please check your internet connection.";
      }
      
      return { 
        success: false, 
        message 
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (refresh) {
        await api.post('auth/logout/', { refresh });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      await AsyncStorage.removeItem(OWNER_NAME_KEY);
      return { success: true };
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
      try {
          const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
          return userJson ? JSON.parse(userJson) : null;
      } catch (error) {
          console.error("Get current user error:", error);
          return null;
      }
  },

  // Refresh Profile
  refreshProfile: async () => {
    try {
      const response = await api.get('auth/profile/');
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Refresh profile error:", error);
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const isMultipart = typeof FormData !== "undefined" && profileData instanceof FormData;
      const response = await api.patch('auth/profile/', profileData, isMultipart ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post('auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Change password error:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.non_field_errors?.[0] ||
          error.response?.data?.new_password?.[0] ||
          "An error occurred. Please try again.",
      };
    }
  },

  // Request Password Reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('auth/password-reset/', { email });
      return { 
        success: true, 
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      console.error("Password reset request error:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.email?.[0] || "An error occurred. Please try again." 
      };
    }
  },

  // Confirm Password Reset
  confirmPasswordReset: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await api.post('auth/password-reset-confirm/', {
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error("Password reset confirm error:", error.response?.data || error.message);
      return { 
        success: false, 
        message:
          error.response?.data?.error ||
          error.response?.data?.otp?.[0] ||
          error.response?.data?.new_password?.[0] ||
          "An error occurred. Please try again." 
      };
    }
  }
};

