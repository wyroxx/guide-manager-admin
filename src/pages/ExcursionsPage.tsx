import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import { excursionKeys, listExcursions } from '../entities/excursion/excursion.api';
import { PAYMENT_STATUS_LABELS } from '../entities/excursion/excursion.types';
import { getErrorMessage } from '../shared/lib/errors';
import { formatDateRange } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function ExcursionsPage() {
  const [search, setSearch] = useState('');
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

  return (
    <main className="page-content">
      <PageHeader
        eyebrow="Расписание"
        title="Экскурсии"
        description="Даты, требования к гидам и заполненность экскурсий."
        actions={(
          <Link className="button-link" to="/excursions/new">
            <Plus size={18} />
            Создать экскурсию
          </Link>
        )}
      />

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Поиск по названию, компании или маршруту"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="result-count">Найдено: {filteredExcursions.length}</span>
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
        <div className="data-table-wrap">
          <table className="data-table excursions-table">
            <thead>
              <tr>
                <th>Экскурсия</th>
                <th>Дата</th>
                <th>Компания</th>
                <th>Гиды</th>
                <th>Оплата</th>
              </tr>
            </thead>
            <tbody>
              {filteredExcursions.map((excursion) => (
                <tr key={excursion.id}>
                  <td>
                    <Link className="entity-link" to={`/excursions/${excursion.id}`}>{excursion.title}</Link>
                    <span className="cell-secondary">{excursion.excursionType || 'Тип не указан'}</span>
                  </td>
                  <td>{formatDateRange(excursion.startDate, excursion.endDate)}</td>
                  <td>{excursion.companyName || companyNames.get(excursion.companyId) || 'Компания не найдена'}</td>
                  <td>
                    <span className={`spots-badge ${excursion.hasSpots ? 'spots-open' : 'spots-full'}`}>
                      {excursion.assignedGuides.length}/{excursion.requiredGuides}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge payment-${excursion.paymentStatus}`}>
                      {PAYMENT_STATUS_LABELS[excursion.paymentStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
