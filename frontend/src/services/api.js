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
  },
  getNews: async (limit = 60) => {
    const response = await axios.get(`${API_URL}/news`, { params: { limit } });
    return response.data;
  },
  createNewsStream: (onMessage) => {
    const es = new EventSource(`${API_URL}/news/stream`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && data.length > 0) onMessage(data);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close(); // return cleanup fn
  }
};
