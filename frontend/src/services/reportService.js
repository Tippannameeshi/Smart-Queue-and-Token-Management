import api from './api';

export const reportService = {
  getQueueStats: () => api.get('/reports/queue-stats'),
  getCounters:  () => api.get('/counters')
};
