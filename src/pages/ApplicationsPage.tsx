import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  applicationKeys,
  listApplications,
  listApplicationsForExcursion,
} from '../entities/application/application.api';
import {
  type ApplicationStatus,
} from '../entities/application/application.types';
import { excursionKeys, listExcursions } from '../entities/excursion/excursion.api';
import { guideKeys, listGuides } from '../entities/guide/guide.api';
import { ApplicationCard } from '../features/decide-application/ApplicationCard';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

type StatusFilter = 'all' | ApplicationStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'pending', label: 'Ожидают' },
  { value: 'accepted', label: 'Приняты' },
  { value: 'rejected', label: 'Отклонены' },
];

export function ApplicationsPage() {
  const { excursionId } = useParams();
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [selectedExcursion, setSelectedExcursion] = useState('all');
  const [search, setSearch] = useState('');
  const applicationsQuery = useQuery({
    queryKey: excursionId ? applicationKeys.byExcursion(excursionId) : applicationKeys.all,
    queryFn: () => excursionId
      ? listApplicationsForExcursion(excursionId)
      : listApplications(),
  });
  const excursionsQuery = useQuery({ queryKey: excursionKeys.all, queryFn: listExcursions });
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });

  const excursionById = useMemo(
    () => new Map((excursionsQuery.data ?? []).map((excursion) => [excursion.id, excursion])),
    [excursionsQuery.data],
  );
  const guideByUid = useMemo(
    () => new Map((guidesQuery.data ?? []).map((guide) => [guide.uid, guide])),
    [guidesQuery.data],
  );
  const applications = applicationsQuery.data ?? [];
  const counts = {
    all: applications.length,
    pending: applications.filter((application) => application.status === 'pending').length,
    accepted: applications.filter((application) => application.status === 'accepted').length,
    rejected: applications.filter((application) => application.status === 'rejected').length,
  };

  const filteredApplications = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('ru');

    return applications.filter((application) => {
      if (status !== 'all' && application.status !== status) return false;
      if (!excursionId && selectedExcursion !== 'all' && application.excursionId !== selectedExcursion) {
        return false;
      }
      if (!needle) return true;

      const excursion = excursionById.get(application.excursionId);
      const guide = guideByUid.get(application.guideUid);
      return `${guide?.name ?? ''} ${application.guideEmail} ${excursion?.title ?? application.excursionTitle}`
        .toLocaleLowerCase('ru')
        .includes(needle);
    });
  }, [applications, excursionById, excursionId, guideByUid, search, selectedExcursion, status]);

  const scopedExcursion = excursionId ? excursionById.get(excursionId) : null;
  const hasFilters = status !== 'pending' || selectedExcursion !== 'all' || Boolean(search);

  return (
    <main className="page-content applications-page">
      <PageHeader
        backTo={excursionId ? `/excursions/${excursionId}` : undefined}
        eyebrow="Модерация"
        title={scopedExcursion ? `Заявки: ${scopedExcursion.title}` : 'Заявки гидов'}
        description="Проверяйте заявки и назначайте гидов без риска переполнить экскурсию."
      />

      <div className="status-tabs" role="tablist" aria-label="Фильтр по статусу">
        {STATUS_FILTERS.map((filter) => (
          <button
            className={status === filter.value ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={status === filter.value}
            key={filter.value}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
            <span>{counts[filter.value]}</span>
          </button>
        ))}
      </div>

      <div className="moderation-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Поиск по гиду или экскурсии"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {!excursionId && (
          <label className="compact-select">
            <span>Экскурсия</span>
            <select value={selectedExcursion} onChange={(event) => setSelectedExcursion(event.target.value)}>
              <option value="all">Все экскурсии</option>
              {(excursionsQuery.data ?? []).map((excursion) => (
                <option key={excursion.id} value={excursion.id}>{excursion.title}</option>
              ))}
            </select>
          </label>
        )}

        {hasFilters && (
          <button
            className="clear-filters secondary-button compact-button"
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedExcursion('all');
              setStatus('pending');
            }}
          >
            <X size={15} />
            Сбросить
          </button>
        )}
      </div>

      {applicationsQuery.isPending && <PageLoading />}
      {applicationsQuery.isError && (
        <ErrorState
          message={getErrorMessage(applicationsQuery.error)}
          onRetry={() => void applicationsQuery.refetch()}
        />
      )}

      {applicationsQuery.isSuccess && filteredApplications.length === 0 && (
        <div className="empty-state moderation-empty">
          <ClipboardCheck size={30} />
          <h2>{applications.length === 0 ? 'Заявок пока нет' : 'Нет заявок по выбранным фильтрам'}</h2>
          <p>{status === 'pending' ? 'Все новые заявки уже обработаны.' : 'Измените фильтры, чтобы увидеть другие заявки.'}</p>
        </div>
      )}

      {applicationsQuery.isSuccess && filteredApplications.length > 0 && (
        <div className="moderation-list">
          {filteredApplications.map((application) => (
            <ApplicationCard
              application={application}
              excursionTitle={excursionById.get(application.excursionId)?.title}
              guideDisplayName={guideByUid.get(application.guideUid)?.name}
              key={`${application.excursionId}-${application.id}`}
              showExcursion={!excursionId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
