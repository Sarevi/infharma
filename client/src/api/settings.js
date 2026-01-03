import apiClient from './client';

/**
 * Get user settings (customAreas, logoUrl, primaryColor)
 */
export const getSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

/**
 * Update user settings
 */
export const updateSettings = async (settingsData) => {
  const response = await apiClient.put('/settings', settingsData);
  return response.data;
};
