import apiClient from './client';

/**
 * Get all drugs (own + global admin templates)
 */
export const getDrugs = async () => {
  const response = await apiClient.get('/drugs');
  return response.data;
};

/**
 * Create a new drug
 */
export const createDrug = async (drugData) => {
  const response = await apiClient.post('/drugs', drugData);
  return response.data;
};

/**
 * Update an existing drug
 */
export const updateDrug = async (id, drugData) => {
  const response = await apiClient.put(`/drugs/${id}`, drugData);
  return response.data;
};

/**
 * Delete a drug
 */
export const deleteDrug = async (id) => {
  const response = await apiClient.delete(`/drugs/${id}`);
  return response.data;
};

/**
 * Reset a drug to original version (deletes user's personal copy)
 */
export const resetDrug = async (id) => {
  const response = await apiClient.post(`/drugs/${id}/reset`);
  return response.data;
};
