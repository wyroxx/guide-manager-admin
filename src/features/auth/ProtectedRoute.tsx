import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'denied' || status === 'error') {
    return <Navigate to="/access-denied" replace />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
