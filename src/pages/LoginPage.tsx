import { FirebaseError } from 'firebase/app';
import { LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Неверный email или пароль.',
  'auth/invalid-email': 'Проверьте формат email.',
  'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
  'auth/user-disabled': 'Этот аккаунт отключён.',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const isAdmin = await login(email.trim(), password);
      navigate(isAdmin ? '/' : '/access-denied', { replace: true });
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : '';
      setMessage(AUTH_ERRORS[code] ?? 'Не удалось войти. Повторите попытку.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Guide Manager</p>
        <h1>Рабочее пространство команды экскурсий.</h1>
        <p>
          Управляйте гидами, компаниями и расписанием из одной спокойной,
          понятной панели.
        </p>
      </section>

      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-icon"><LockKeyhole size={22} /></div>
        <p className="eyebrow">Только для администраторов</p>
        <h2 id="login-title">Вход в админку</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {message && <p className="form-error" role="alert">{message}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Проверяем доступ...' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  );
}
