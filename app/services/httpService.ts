import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // Replace with your actual API base URL
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized! Redirecting to login...");
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch,
};
