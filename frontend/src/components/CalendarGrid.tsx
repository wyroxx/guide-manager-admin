// CalendarGrid.tsx
// Displays calendar grid with excursions.
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { Excursion } from '../services/api';
import './CalendarGrid.css';

interface CalendarGridProps {
  selectedDate: Date;
  excursions: Excursion[];
  onExcursionClick: (excursion: Excursion) => void;
  onDateClick: (date: Date) => void;
  isLoading: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  excursions,
  onExcursionClick,
  onDateClick,
  isLoading
}) => {
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getExcursionsForDate = (date: Date) => {
    return excursions.filter(excursion =>
      isSameDay(new Date(excursion.date), date)
    );
  };

  if (isLoading) {
    return (
      <div className="calendar-grid loading">
        <div className="loading-spinner">Загружаем экскурсии...</div>
      </div>
    );
  }

  const days = getDaysInMonth(selectedDate);

  return (
    <div className="calendar-grid">
      <div className="calendar-header">
        <h2>{format(selectedDate, 'MMMM yyyy')}</h2>
      </div>

      <div className="calendar-weekdays">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map(day => {
          const dayExcursions = getExcursionsForDate(day);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${isCurrentDay ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <div className="day-number">
                {format(day, 'd')}
              </div>

              <div className="day-tours">
                {dayExcursions.map(excursion => (
                  <div
                    key={excursion.id}
                    className="tour-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcursionClick(excursion);
                    }}
                  >
                    <div className="tour-time">
                      {excursion.time}
                    </div>
                    <div className="tour-name">{excursion.route}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
