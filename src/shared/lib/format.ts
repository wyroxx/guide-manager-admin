import { Timestamp } from 'firebase/firestore';

export function formatTimestamp(value: Timestamp | null | undefined) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate());
}

export function formatDateRange(
  start: Timestamp | null | undefined,
  end: Timestamp | null | undefined,
) {
  if (!start || !end) return 'Дата не указана';

  const date = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(start.toDate());
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const startDate = start.toDate();
  const endDate = end.toDate();
  const sameDay = startDate.getFullYear() === endDate.getFullYear()
    && startDate.getMonth() === endDate.getMonth()
    && startDate.getDate() === endDate.getDate();

  if (sameDay) return `${date}, ${time.format(startDate)}–${time.format(endDate)}`;

  const dateTime = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return `${dateTime.format(startDate)} — ${dateTime.format(endDate)}`;
}

export function toDateTimeLocalValue(value: Timestamp | null | undefined) {
  if (!value) return '';
  const date = value.toDate();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
