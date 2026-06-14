import { Clock3, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Excursion } from '../../entities/excursion/excursion.types';
import {
  excursionsForDay,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  isSameMonth,
} from '../../shared/lib/calendar';

export type CalendarView = 'month' | 'week' | 'day';

interface ExcursionCalendarProps {
  anchorDate: Date;
  companyNames: Map<string, string>;
  excursions: Excursion[];
  view: CalendarView;
  onSelectDay: (date: Date) => void;
}

interface EventCardProps {
  compact?: boolean;
  companyNames: Map<string, string>;
  excursion: Excursion;
  showDate?: boolean;
}

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function companyName(excursion: Excursion, names: Map<string, string>) {
  return excursion.companyName || names.get(excursion.companyId) || 'Компания не найдена';
}

function eventTime(excursion: Excursion) {
  if (!excursion.startDate || !excursion.endDate) return 'Время не указано';
  return `${timeFormatter.format(excursion.startDate.toDate())}–${timeFormatter.format(excursion.endDate.toDate())}`;
}

function EventCard({ compact = false, companyNames, excursion, showDate = false }: EventCardProps) {
  return (
    <Link
      className={`calendar-event ${excursion.hasSpots ? 'calendar-event-open' : 'calendar-event-full'} ${compact ? 'calendar-event-compact' : ''}`}
      to={`/excursions/${excursion.id}`}
      title={`${excursion.title} · ${companyName(excursion, companyNames)}`}
    >
      <div className="calendar-event-heading">
        <span className="calendar-event-time">
          {showDate && excursion.startDate
            ? `${dayFormatter.format(excursion.startDate.toDate())}, `
            : ''}
          {excursion.startDate ? timeFormatter.format(excursion.startDate.toDate()) : '—'}
        </span>
        <span className="calendar-event-spots">{excursion.assignedGuides.length}/{excursion.requiredGuides}</span>
      </div>
      <strong>{excursion.title}</strong>
      {!compact && (
        <>
          <span className="calendar-event-company">{companyName(excursion, companyNames)}</span>
          <span className="calendar-event-meta"><Clock3 size={13} /> {eventTime(excursion)}</span>
        </>
      )}
    </Link>
  );
}

function MonthView({ anchorDate, companyNames, excursions, onSelectDay }: Omit<ExcursionCalendarProps, 'view'>) {
  const days = getMonthGridDays(anchorDate);
  const today = new Date();

  return (
    <div className="month-calendar">
      <div className="month-weekdays">
        {getWeekDays(anchorDate).map((day) => (
          <span key={day.toISOString()}>{weekdayFormatter.format(day)}</span>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dayExcursions = excursionsForDay(excursions, day);
          const visible = dayExcursions.slice(0, 3);

          return (
            <section
              className={`month-day ${!isSameMonth(day, anchorDate) ? 'month-day-muted' : ''} ${isSameDay(day, today) ? 'calendar-today' : ''}`}
              key={day.toISOString()}
            >
              <button className="month-day-number" type="button" onClick={() => onSelectDay(day)}>
                {day.getDate()}
              </button>
              <div className="month-day-events">
                {visible.map((excursion) => (
                  <EventCard compact companyNames={companyNames} excursion={excursion} key={excursion.id} />
                ))}
                {dayExcursions.length > visible.length && (
                  <button className="more-events" type="button" onClick={() => onSelectDay(day)}>
                    Ещё {dayExcursions.length - visible.length}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ anchorDate, companyNames, excursions, onSelectDay }: Omit<ExcursionCalendarProps, 'view'>) {
  const today = new Date();

  return (
    <div className="week-calendar">
      {getWeekDays(anchorDate).map((day) => {
        const dayExcursions = excursionsForDay(excursions, day);

        return (
          <section className={`week-day ${isSameDay(day, today) ? 'calendar-today' : ''}`} key={day.toISOString()}>
            <button className="week-day-header" type="button" onClick={() => onSelectDay(day)}>
              <span>{weekdayFormatter.format(day)}</span>
              <strong>{day.getDate()}</strong>
            </button>
            <div className="week-day-events">
              {dayExcursions.length === 0 ? (
                <span className="calendar-no-events">Нет экскурсий</span>
              ) : (
                dayExcursions.map((excursion) => (
                  <EventCard companyNames={companyNames} excursion={excursion} key={excursion.id} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DayView({ anchorDate, companyNames, excursions }: Omit<ExcursionCalendarProps, 'view' | 'onSelectDay'>) {
  const dayExcursions = excursionsForDay(excursions, anchorDate);

  if (dayExcursions.length === 0) {
    return (
      <div className="day-calendar-empty">
        <span>{fullDateFormatter.format(anchorDate)}</span>
        <strong>На этот день экскурсий нет</strong>
      </div>
    );
  }

  return (
    <div className="day-calendar">
      <div className="day-timeline-line" />
      {dayExcursions.map((excursion) => (
        <div className="day-event-row" key={excursion.id}>
          <div className="day-event-time">
            <strong>{excursion.startDate ? timeFormatter.format(excursion.startDate.toDate()) : '—'}</strong>
            <span>{excursion.endDate ? timeFormatter.format(excursion.endDate.toDate()) : '—'}</span>
          </div>
          <div className={`day-event-card ${excursion.hasSpots ? 'day-event-open' : 'day-event-full'}`}>
            <div className="day-event-main">
              <span className="calendar-event-company">{companyName(excursion, companyNames)}</span>
              <Link to={`/excursions/${excursion.id}`}>{excursion.title}</Link>
              <span><MapPin size={14} /> {excursion.meetingPlace || 'Место встречи не указано'}</span>
            </div>
            <div className="day-event-side">
              <span><Users size={15} /> {excursion.assignedGuides.length}/{excursion.requiredGuides}</span>
              <span>{excursion.excursionType || 'Тип не указан'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExcursionCalendar(props: ExcursionCalendarProps) {
  if (props.view === 'month') return <MonthView {...props} />;
  if (props.view === 'week') return <WeekView {...props} />;
  return <DayView {...props} />;
}
