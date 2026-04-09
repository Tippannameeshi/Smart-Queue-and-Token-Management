import api from './api';

export const userService = {
  getAllUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUserRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`)
};
