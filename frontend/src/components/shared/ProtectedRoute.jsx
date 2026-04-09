import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getRoleRoute, hasRequiredRole } from '../../utils/roleUtils';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <div className="glass-panel rounded-[24px] border border-white/10 px-6 py-5 text-white">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRequiredRole(user.role, roles)) {
    return <Navigate to={getRoleRoute(user.role)} replace />;
  }

  return <Outlet />;
}
