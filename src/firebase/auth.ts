import {
  browserLocalPersistence,
  getIdTokenResult,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './client';

export async function signInAdmin(email: string, password: string) {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const isAdmin = await userHasAdminClaim(credential.user, true);

  return { user: credential.user, isAdmin };
}

export async function userHasAdminClaim(user: User, forceRefresh = false) {
  const token = await getIdTokenResult(user, forceRefresh);
  return token.claims.admin === true;
}

export function signOutAdmin() {
  return signOut(auth);
}
