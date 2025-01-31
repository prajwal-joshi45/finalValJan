import axios from 'axios';

const API_BASE_URL = 'https://finalvaljan-backend.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const linkService = {
  getLinks: async () => {
    try {
      const response = await axiosInstance.get('/links');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  },

  createLink: async (linkData) => {
    try {
      const response = await axiosInstance.post('/links', {
        originalLink: linkData.destinationUrl,
        remarks: linkData.comments,
        status: 'active',
        expirationDate: linkData.hasExpiration ? linkData.expirationDate : null
      });
      return response.data;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  deleteLink: async (linkId) => {
    try {
      const response = await axiosInstance.delete(`/links/${linkId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }
};

export default linkService;
