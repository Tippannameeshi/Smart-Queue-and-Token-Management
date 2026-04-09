import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register/customer', data),
  logout: () => localStorage.removeItem('jwt')
};
