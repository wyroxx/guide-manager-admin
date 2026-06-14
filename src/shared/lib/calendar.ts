import { type Excursion } from '../../entities/excursion/excursion.types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  return addDays(startOfDay(date), 1 - day);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth();
}

export function getMonthGridDays(date: Date) {
  const firstDay = startOfWeek(startOfMonth(date));
  const lastMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastGridDay = addDays(startOfWeek(lastMonthDay), 6);
  const days = Math.round((startOfDay(lastGridDay).getTime() - firstDay.getTime()) / DAY_MS) + 1;

  return Array.from({ length: days }, (_, index) => addDays(firstDay, index));
}

export function getWeekDays(date: Date) {
  const firstDay = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));
}

export function excursionOccursOnDay(excursion: Excursion, day: Date) {
  if (!excursion.startDate || !excursion.endDate) return false;

  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  const excursionStart = excursion.startDate.toMillis();
  const excursionEnd = excursion.endDate.toMillis();

  return excursionStart < dayEnd && excursionEnd > dayStart;
}

export function excursionsForDay(excursions: Excursion[], day: Date) {
  return excursions
    .filter((excursion) => excursionOccursOnDay(excursion, day))
    .sort((left, right) =>
      (left.startDate?.toMillis() ?? 0) - (right.startDate?.toMillis() ?? 0),
    );
}

export function formatCalendarTitle(date: Date, view: 'month' | 'week' | 'day') {
  if (view === 'month') {
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  if (view === 'day') {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  const week = getWeekDays(date);
  const start = week[0];
  const end = week[6];
  const startLabel = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
  }).format(start);
  const endLabel = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end);

  return `${startLabel} — ${endLabel}`;
}

export function shiftCalendarDate(
  date: Date,
  view: 'month' | 'week' | 'day',
  direction: -1 | 1,
) {
  if (view === 'month') return addMonths(date, direction);
  if (view === 'week') return addDays(date, direction * 7);
  return addDays(date, direction);
}
