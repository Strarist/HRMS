import api from './axios';

/**
 * Get user theme preference
 */
export const getThemePreference = async () => {
  const response = await api.get('/user/theme');
  return response.data;
};

/**
 * Update user theme preference
 */
export const updateThemePreference = async (themePreference) => {
  const response = await api.put('/user/theme', { themePreference });
  return response.data;
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};
