import { FirebaseError } from 'firebase/app';

const FIREBASE_MESSAGES: Record<string, string> = {
  'permission-denied': 'Недостаточно прав для выполнения операции.',
  'not-found': 'Запись не найдена.',
  'already-exists': 'Запись с таким идентификатором уже существует.',
  unavailable: 'Firebase временно недоступен. Повторите попытку.',
};

export function getErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    const shortCode = error.code.replace('firestore/', '');
    return FIREBASE_MESSAGES[shortCode] ?? error.message;
  }

  return error instanceof Error ? error.message : 'Произошла неизвестная ошибка.';
}
