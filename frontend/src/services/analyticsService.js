import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsService = {
  getAnalytics: async () => {
    try {
      const response = await axiosInstance.get('/analytics/all');
      return response.data.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        originalLink: item.originalLink,
        shortLink: item.shortLink,
        ipAddress: item.ipAddress,
        userDevice: item.userDevice
      }));
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw error;
    }
  },

  trackClick: async (linkId) => {
    try {
      const response = await axiosInstance.post(`/analytics/track/${linkId}`);
      return response.data;
    } catch (error) {
      console.error('Click tracking error:', error);
      throw error;
    }
  }
};

export default analyticsService;