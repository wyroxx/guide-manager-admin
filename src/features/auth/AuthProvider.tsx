import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { auth } from '../../firebase/client';
import {
  signInAdmin,
  signOutAdmin,
  userHasAdminClaim,
} from '../../firebase/auth';

type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'denied'
  | 'error';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Не удалось проверить доступ.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;

      setUser(nextUser);
      setError(null);

      if (!nextUser) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('loading');

      try {
        const isAdmin = await userHasAdminClaim(nextUser, true);
        if (active) setStatus(isAdmin ? 'authenticated' : 'denied');
      } catch (nextError) {
        if (active) {
          setError(errorMessage(nextError));
          setStatus('error');
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    setError(null);

    try {
      const result = await signInAdmin(email, password);
      setUser(result.user);
      setStatus(result.isAdmin ? 'authenticated' : 'denied');
      return result.isAdmin;
    } catch (nextError) {
      setUser(null);
      setError(errorMessage(nextError));
      setStatus('unauthenticated');
      throw nextError;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutAdmin();
    setUser(null);
    setError(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, error, login, logout }),
    [error, login, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
