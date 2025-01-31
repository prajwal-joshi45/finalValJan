import axios from 'axios';

const API_BASE_URL = 'https://finalvaljan-backend.onrender.com/api/analytics';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsService = {
  async getAnalytics() {
    try {
      const response = await axiosInstance.get('/list');
      const analytics = Array.isArray(response.data) ? response.data : [];
      
      return analytics.map(item => ({
        id: item._id || '',
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A',
        originalLink: item.linkData?.[0]?.originalLink || 'N/A',
        shortLink: item.linkData?.[0]?.shortLink || 'N/A',
        ipAddress: item.ipAddress || 'N/A',
        userDevice: item.userDevice || 'Unknown'
      }));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }
};

export default analyticsService;
