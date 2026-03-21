import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const DEFAULT_BASE_URL = 'http://172.20.10.4:8000/api/v1/';

const getStoredBaseUrl = async () => {
  const stored = await AsyncStorage.getItem('apiBaseUrl');
  if (!stored) return DEFAULT_BASE_URL;
  return stored.endsWith('/') ? stored : `${stored}/`;
};

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const api = axios.create({
  // baseURL will be set dynamically by the interceptor
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Use raw axios to avoid the interceptor adding an expired access token
  const baseUrl = await getStoredBaseUrl();
  const response = await axios.post(`${baseUrl}auth/token/refresh/`, {
    refresh: refreshToken,
  });

  const newToken = response?.data?.access;
  if (!newToken) {
    throw new Error('No access token returned');
  }

  await AsyncStorage.setItem(TOKEN_KEY, newToken);
  return newToken;
};

// Request interceptor to add token and set baseURL dynamically
api.interceptors.request.use(
  async (config) => {
    try {
      // Allow overriding the base URL (e.g., for switching between environments)
      config.baseURL = await getStoredBaseUrl();

      // Add token for authenticated requests (skip for login/register)
      const isAuthRequest = config.url.includes('auth/login') || config.url.includes('auth/register');
      if (!isAuthRequest) {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error types
    if (!error.response) {
      // Network error
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Cannot reach server. Please check your internet connection and API URL.',
        type: 'network',
        originalError: error,
      });
    }

    const status = error.response.status;
    console.error(`API Error: ${status} ${error.config.url}`, error.response.data);

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If the request is already for refreshing the token, just fail
      const isRefreshRequest = originalRequest.url?.includes('token/refresh');
      if (isRefreshRequest) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return Promise.reject({
          message: 'Your session has expired. Please login again.',
          type: 'auth',
          originalError: error,
        });
      }

      try {
        if (isRefreshing) {
          // Queue the request until the token is refreshed
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        isRefreshing = true;
        const newToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        onRefreshed(newToken);
        return api(originalRequest);
      } catch (refreshError) {
        refreshSubscribers = [];
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return Promise.reject({
          message: 'Your session has expired. Please login again.',
          type: 'auth',
          originalError: refreshError,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    let message = 'An error occurred. Please try again.';
    if (status === 400) {
      message = error.response.data?.message || 'Invalid request. Please check your input.';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'Resource not found.';
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    }

    return Promise.reject({
      message,
      type: 'server',
      status,
      data: error.response.data,
      originalError: error,
    });
  }
);

// Test API connection
export const testConnection = async (baseUrl) => {
  try {
    const testApi = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
    });

    // Try to access the root API endpoint
    const response = await testApi.get('/');
    
    return {
      success: true,
      message: 'Connected successfully!',
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    
    if (!error.response) {
      return {
        success: false,
        message: 'Cannot reach server. Check your URL and network connection.',
        error: error.message,
      };
    }

    return {
      success: false,
      message: `Server responded with error: ${error.response.status}`,
      error: error.message,
      status: error.response?.status,
    };
  }
};

// Get current API base URL
export const getApiBaseUrl = async () => {
  try {
    return await getStoredBaseUrl();
  } catch (error) {
    return DEFAULT_BASE_URL;
  }
};

// Set API base URL
export const setApiBaseUrl = async (url) => {
  try {
    // Ensure URL ends with a trailing slash for axios path concatenation
    const formattedUrl = url.endsWith('/') ? url : `${url}/`;
    await AsyncStorage.setItem('apiBaseUrl', formattedUrl);
    return true;
  } catch (error) {
    console.error('Failed to save API URL:', error);
    return false;
  }
};

export const getAppConfig = async () => {
  try {
    const response = await api.get('config/');
    return response.data;
  } catch (error) {
    console.error('Error fetching app config:', error);
    throw error;
  }
};

export default api;
