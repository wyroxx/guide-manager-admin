import { ShieldX } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { LoadingScreen } from '../shared/ui/LoadingScreen';

export function AccessDeniedPage() {
  const { error, logout, status, user } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  return (
    <main className="centered-page">
      <section className="message-card">
        <div className="message-icon"><ShieldX size={28} /></div>
        <p className="eyebrow">Access denied</p>
        <h1>{status === 'error' ? 'Не удалось проверить доступ' : 'Нет прав администратора'}</h1>
        {status === 'denied' && (
          <p>
            Аккаунт {user?.email ?? 'пользователя'} авторизован, но claim
            <code> admin: true</code> не найден.
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
        <button type="button" onClick={() => void logout()}>
          Войти другим аккаунтом
        </button>
      </section>
    </main>
  );
}
