import apiClient from './apiClient';

/**
 * Authentication Service Layer
 */
export const authService = {
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  async register(userData) {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  async googleAuth(googleUser) {
    const { data } = await apiClient.post('/auth/google', googleUser);
    return data;
  },

  async getProfile() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  async updateProfile(profileData) {
    const { data } = await apiClient.put('/auth/profile', profileData);
    return data;
  },
};

export default authService;

