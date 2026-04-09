import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import AdminPage from './pages/AdminPage';
import CustomerPage from './pages/CustomerPage';
import LoginPage from './pages/LoginPage';
import ManagerPage from './pages/ManagerPage';
import OperatorPage from './pages/OperatorPage';
import { getRoleRoute } from './utils/roleUtils';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? getRoleRoute(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute roles="CUSTOMER" />}>
            <Route path="/customer" element={<CustomerPage />} />
          </Route>
          <Route element={<ProtectedRoute roles="OPERATOR" />}>
            <Route path="/operator" element={<OperatorPage />} />
          </Route>
          <Route element={<ProtectedRoute roles="MANAGER" />}>
            <Route path="/manager" element={<ManagerPage />} />
          </Route>
          <Route element={<ProtectedRoute roles="ADMIN" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
