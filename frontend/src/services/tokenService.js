import api from './api';

export const tokenService = {
  generateToken:  (data) => api.post('/tokens/generate', data),
  getMyTokens:    () => api.get('/tokens/my'),
  getTokenStatus: (num)  => api.get(`/tokens/status/${num}`),
  getQueue:       ()     => api.get('/tokens/queue'),
  callNext:       (cId)  => api.post(`/tokens/call-next/${cId}`),
  updateStatus:   (id, status) => api.patch(`/tokens/${id}/status`, { status }),
  skipToken:      (id)   => api.patch(`/tokens/${id}/skip`),
  deleteToken:    (id)   => api.delete(`/tokens/${id}`),
  submitFeedback: (data) => api.post('/feedback', data)
};
