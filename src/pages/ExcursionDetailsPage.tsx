import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Pencil, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import {
  applicationKeys,
  listApplicationsForExcursion,
} from '../entities/application/application.api';
import {
  deleteExcursion,
  excursionKeys,
  getExcursion,
} from '../entities/excursion/excursion.api';
import { PAYMENT_STATUS_LABELS } from '../entities/excursion/excursion.types';
import { GUIDE_LEVEL_LABELS } from '../entities/guide/guide.types';
import { guideKeys, listGuides } from '../entities/guide/guide.api';
import { ApplicationCard } from '../features/decide-application/ApplicationCard';
import { getErrorMessage } from '../shared/lib/errors';
import { formatDateRange } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { DeleteButton } from '../shared/ui/DeleteButton';
import { PageHeader } from '../shared/ui/PageHeader';

export function ExcursionDetailsPage() {
  const { excursionId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const excursionQuery = useQuery({
    queryKey: excursionKeys.detail(excursionId),
    queryFn: () => getExcursion(excursionId),
    enabled: Boolean(excursionId),
  });
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });
  const applicationsQuery = useQuery({
    queryKey: applicationKeys.byExcursion(excursionId),
    queryFn: () => listApplicationsForExcursion(excursionId),
    enabled: Boolean(excursionId),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteExcursion(excursionId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: excursionKeys.detail(excursionId) });
      await queryClient.invalidateQueries({ queryKey: excursionKeys.all });
      navigate('/excursions', { replace: true });
    },
  });

  if (excursionQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (excursionQuery.isError) return <main className="page-content"><ErrorState message={getErrorMessage(excursionQuery.error)} onRetry={() => void excursionQuery.refetch()} /></main>;
  if (!excursionQuery.data) return <main className="page-content"><ErrorState message="Экскурсия не найдена." /></main>;

  const excursion = excursionQuery.data;
  const companyName = excursion.companyName
    || companiesQuery.data?.find((company) => company.id === excursion.companyId)?.name
    || 'Компания не найдена';

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/excursions"
        eyebrow="Карточка экскурсии"
        title={excursion.title}
        description={formatDateRange(excursion.startDate, excursion.endDate)}
        actions={(
          <Link className="button-link secondary-button" to={`/excursions/${excursion.id}/edit`}>
            <Pencil size={17} />
            Редактировать
          </Link>
        )}
      />

      <section className="details-card">
        <div className="excursion-status-line">
          <span className={`spots-badge ${excursion.hasSpots ? 'spots-open' : 'spots-full'}`}>
            {excursion.hasSpots ? 'Есть свободные места' : 'Все места заняты'}
          </span>
          <span className={`payment-badge payment-${excursion.paymentStatus}`}>
            {PAYMENT_STATUS_LABELS[excursion.paymentStatus]}
          </span>
        </div>
        <dl className="details-grid">
          <div><dt>Компания</dt><dd><Link className="entity-link" to={`/companies/${excursion.companyId}`}>{companyName}</Link></dd></div>
          <div><dt>Тип</dt><dd>{excursion.excursionType || '—'}</dd></div>
          <div><dt>Место встречи</dt><dd>{excursion.meetingPlace || '—'}</dd></div>
          <div><dt>Участников</dt><dd>До {excursion.maxParticipants}</dd></div>
          <div><dt>Гиды</dt><dd>{excursion.assignedGuides.length} из {excursion.requiredGuides}</dd></div>
          <div><dt>Дополнительно</dt><dd>{[excursion.hasLunch && 'Обед', excursion.hasMasterclass && 'Мастер-класс'].filter(Boolean).join(', ') || '—'}</dd></div>
          <div className="details-wide"><dt>Допустимые уровни</dt><dd className="badge-list">{excursion.requiredLevels.map((level) => <span className={`level-badge level-${level}`} key={level}>{GUIDE_LEVEL_LABELS[level]}</span>)}</dd></div>
          <div className="details-wide"><dt>Маршрут</dt><dd className="preserve-lines">{excursion.route || '—'}</dd></div>
        </dl>
      </section>

      <section className="related-card">
        <div className="section-heading">
          <div><p className="eyebrow">Назначения</p><h2>Назначенные гиды</h2></div>
          <span className="count-badge"><Users size={15} /> {excursion.assignedGuides.length}</span>
        </div>
        {excursion.assignedGuides.length === 0 ? (
          <div className="inline-empty">Гиды пока не назначены.</div>
        ) : (
          <div className="email-list">
            {excursion.assignedGuides.map((email) => <span key={email}>{email}</span>)}
          </div>
        )}
      </section>

      <section className="related-card">
        <div className="section-heading">
          <div><p className="eyebrow">Заявки</p><h2>Заявки гидов</h2></div>
          <div className="section-heading-actions">
            <span className="count-badge">{applicationsQuery.data?.length ?? 0}</span>
            <Link className="inline-link" to={`/excursions/${excursionId}/applications`}>
              Все заявки <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        {applicationsQuery.isPending && <div className="inline-status">Загружаем заявки...</div>}
        {applicationsQuery.isError && <p className="form-error">{getErrorMessage(applicationsQuery.error)}</p>}
        {applicationsQuery.isSuccess && applicationsQuery.data.length === 0 && <div className="inline-empty">Заявок пока нет.</div>}
        {applicationsQuery.isSuccess && applicationsQuery.data.length > 0 && (
          <div className="moderation-list compact-moderation-list">
            {applicationsQuery.data.slice(0, 3).map((application) => (
              <ApplicationCard
                application={application}
                guideDisplayName={guidesQuery.data?.find((guide) => guide.uid === application.guideUid)?.name}
                key={application.id}
                showExcursion={false}
              />
            ))}
          </div>
        )}
        {applicationsQuery.isSuccess && applicationsQuery.data.length > 3 && (
          <p className="section-note">Показаны первые 3 заявки. Полный список доступен по ссылке выше.</p>
        )}
      </section>

      <section className="danger-zone">
        <div>
          <h2>Удалить экскурсию</h2>
          <p>Экскурсия и её заявки будут удалены. Это действие невозможно отменить.</p>
          {deleteMutation.isError && <p className="form-error">{getErrorMessage(deleteMutation.error)}</p>}
        </div>
        <DeleteButton
          label={`Удалить экскурсию «${excursion.title}»?`}
          pending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutateAsync()}
        />
      </section>
    </main>
  );
}
