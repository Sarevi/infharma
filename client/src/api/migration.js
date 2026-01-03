import apiClient from './client';

/**
 * Migrate drugs from localStorage to database
 */
export const migrateDrugs = async (drugs) => {
  const response = await apiClient.post('/migrate/drugs', { drugs });
  return response.data;
};
