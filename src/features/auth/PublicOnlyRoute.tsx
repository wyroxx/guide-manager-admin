import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  if (status === 'denied' || status === 'error') {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
