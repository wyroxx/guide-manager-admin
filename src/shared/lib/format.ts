import { Timestamp } from 'firebase/firestore';

export function formatTimestamp(value: Timestamp | null | undefined) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate());
}
