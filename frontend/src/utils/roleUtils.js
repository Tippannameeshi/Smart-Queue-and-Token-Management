export const ROLE_OPTIONS = ['CUSTOMER', 'OPERATOR', 'MANAGER', 'ADMIN'];

export function getRoleLabel(role = '') {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'MANAGER') return 'Manager';
  if (role === 'OPERATOR') return 'Operator';
  if (role === 'CUSTOMER') return 'Customer';
  return 'User';
}

export function getRoleRoute(role = '') {
  if (role === 'ADMIN') return '/admin';
  if (role === 'MANAGER') return '/manager';
  if (role === 'OPERATOR') return '/operator';
  return '/customer';
}

export function hasRequiredRole(role = '', requiredRoles) {
  if (!requiredRoles) {
    return true;
  }

  const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return allowedRoles.includes(role);
}
