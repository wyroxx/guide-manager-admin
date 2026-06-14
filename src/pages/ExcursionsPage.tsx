import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import { excursionKeys, listExcursions } from '../entities/excursion/excursion.api';
import {
  ExcursionCalendar,
  type CalendarView,
} from '../features/excursion-calendar/ExcursionCalendar';
import {
  formatCalendarTitle,
  shiftCalendarDate,
} from '../shared/lib/calendar';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

const CALENDAR_VIEWS: Array<{ value: CalendarView; label: string }> = [
  { value: 'month', label: 'Месяц' },
  { value: 'week', label: 'Неделя' },
  { value: 'day', label: 'День' },
];

function initialView(): CalendarView {
  const saved = window.localStorage.getItem('excursions-calendar-view');
  return saved === 'week' || saved === 'day' ? saved : 'month';
}

export function ExcursionsPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<CalendarView>(initialView);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const excursionsQuery = useQuery({ queryKey: excursionKeys.all, queryFn: listExcursions });
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });
  const companyNames = useMemo(
    () => new Map((companiesQuery.data ?? []).map((company) => [company.id, company.name])),
    [companiesQuery.data],
  );

  const filteredExcursions = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('ru');
    if (!needle) return excursionsQuery.data ?? [];

    return (excursionsQuery.data ?? []).filter((excursion) => {
      const companyName = excursion.companyName || companyNames.get(excursion.companyId) || '';
      return `${excursion.title} ${companyName} ${excursion.route}`
        .toLocaleLowerCase('ru')
        .includes(needle);
    });
  }, [companyNames, excursionsQuery.data, search]);

  const withoutDates = filteredExcursions.filter(
    (excursion) => !excursion.startDate || !excursion.endDate,
  ).length;

  function changeView(nextView: CalendarView) {
    setView(nextView);
    window.localStorage.setItem('excursions-calendar-view', nextView);
  }

  function selectDay(date: Date) {
    setAnchorDate(date);
    changeView('day');
  }

  return (
    <main className="page-content calendar-page">
      <PageHeader
        eyebrow="Расписание"
        title="Экскурсии"
        description="Календарь экскурсий, требования к гидам и заполненность команды."
        actions={(
          <Link className="button-link" to="/excursions/new">
            <Plus size={18} />
            Создать экскурсию
          </Link>
        )}
      />

      <div className="calendar-filter-row">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Поиск по названию, компании или маршруту"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="result-count">Экскурсий: {filteredExcursions.length}</span>
      </div>

      {excursionsQuery.isPending && <PageLoading />}
      {excursionsQuery.isError && (
        <ErrorState
          message={getErrorMessage(excursionsQuery.error)}
          onRetry={() => void excursionsQuery.refetch()}
        />
      )}

      {excursionsQuery.isSuccess && filteredExcursions.length === 0 && (
        <div className="empty-state">
          <CalendarDays size={30} />
          <h2>{search ? 'Ничего не найдено' : 'Экскурсий пока нет'}</h2>
          <p>{search ? 'Попробуйте изменить поисковый запрос.' : 'Создайте первую экскурсию.'}</p>
        </div>
      )}

      {excursionsQuery.isSuccess && filteredExcursions.length > 0 && (
        <section className="calendar-shell">
          <header className="calendar-toolbar">
            <div className="calendar-navigation">
              <button
                className="calendar-icon-button"
                type="button"
                aria-label="Предыдущий период"
                onClick={() => setAnchorDate((date) => shiftCalendarDate(date, view, -1))}
              >
                <ChevronLeft size={19} />
              </button>
              <button className="today-button" type="button" onClick={() => setAnchorDate(new Date())}>
                Сегодня
              </button>
              <button
                className="calendar-icon-button"
                type="button"
                aria-label="Следующий период"
                onClick={() => setAnchorDate((date) => shiftCalendarDate(date, view, 1))}
              >
                <ChevronRight size={19} />
              </button>
            </div>

            <h2>{formatCalendarTitle(anchorDate, view)}</h2>

            <div className="calendar-view-switch" aria-label="Режим календаря">
              {CALENDAR_VIEWS.map((option) => (
                <button
                  className={view === option.value ? 'active' : ''}
                  type="button"
                  key={option.value}
                  onClick={() => changeView(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </header>

          {withoutDates > 0 && (
            <div className="calendar-warning">
              {withoutDates} {withoutDates === 1 ? 'экскурсия не отображена' : 'экскурсии не отображены'}: не заполнены даты.
            </div>
          )}

          <ExcursionCalendar
            anchorDate={anchorDate}
            companyNames={companyNames}
            excursions={filteredExcursions}
            view={view}
            onSelectDay={selectDay}
          />
        </section>
      )}
    </main>
  );
}
