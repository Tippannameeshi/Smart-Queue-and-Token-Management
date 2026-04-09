import api from './api';

export const counterService = {
  createCounter: (data) => api.post('/counters', data),
  updateCounter: (id, data) => api.patch(`/counters/${id}`, data),
  deleteCounter: (id) => api.delete(`/counters/${id}`)
};
