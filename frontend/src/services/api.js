import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  getTrends: async () => {
    const response = await axios.get(`${API_URL}/trends`);
    return response.data;
  },
  searchTrends: async (keyword) => {
    const response = await axios.get(`${API_URL}/search`, {
      params: { keyword }
    });
    return response.data;
  },
  getInsights: async () => {
    const response = await axios.get(`${API_URL}/insights`);
    return response.data;
  },
  getStatus: async () => {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  },
  refreshTrends: async () => {
    const response = await axios.post(`${API_URL}/refresh`);
    return response.data;
  }
};
