const API_URL = 'https://finalvaljan-backend.onrender.com/api';

export const register = async (userData) => {
  console.log('Sending registration data:', userData); // Add this log
  
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      console.log('Server error response:', errorData); // Add this log
      throw new Error(errorData.message || 'Registration failed');
    } else {
      throw new Error('Registration failed');
    }
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    } else {
      throw new Error('Login failed');
    }
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};


// services/authService.js

export const getUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to update user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/user`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// services/linkService.js
export const getLinks = async () => {
  try {
    const response = await fetch(`${API_URL}/links`);
    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching links:', error);
    throw error;
  }
};

export const deleteLink = async (id) => {
  try {
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete link');
    }
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
};

// services/analyticsService.js
export const getAnalytics = async () => {
  try {
    const response = await fetch(`${API_URL}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// export const getStatistics = async () => {
//   try {
//     const response = await fetch(`${API_URL}/analytics/statistics`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch statistics');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching statistics:', error);
//     throw error;
//   }
// };

export const getStatistics = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/analytics/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
