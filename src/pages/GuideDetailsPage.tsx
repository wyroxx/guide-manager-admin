import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { approveGuide, deleteGuide, getGuide, guideKeys } from '../entities/guide/guide.api';
import { GUIDE_LEVEL_LABELS, isGuideLevel } from '../entities/guide/guide.types';
import { useAuth } from '../features/auth/AuthProvider';
import { getErrorMessage } from '../shared/lib/errors';
import { formatTimestamp } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { DeleteButton } from '../shared/ui/DeleteButton';
import { PageHeader } from '../shared/ui/PageHeader';

export function GuideDetailsPage() {
  const { uid = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const guideQuery = useQuery({
    queryKey: guideKeys.detail(uid),
    queryFn: () => getGuide(uid),
    enabled: Boolean(uid),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteGuide(uid),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: guideKeys.detail(uid) });
      await queryClient.invalidateQueries({ queryKey: guideKeys.all });
      navigate('/guides', { replace: true });
    },
  });
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await approveGuide(uid, user.uid);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: guideKeys.all }),
        queryClient.invalidateQueries({ queryKey: guideKeys.detail(uid) }),
      ]);
    },
  });

  if (guideQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (guideQuery.isError) {
    return <main className="page-content"><ErrorState message={getErrorMessage(guideQuery.error)} onRetry={() => void guideQuery.refetch()} /></main>;
  }
  if (!guideQuery.data) {
    return <main className="page-content"><ErrorState message="Гид не найден." /></main>;
  }

  const guide = guideQuery.data;

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/guides"
        eyebrow="Профиль гида"
        title={guide.name}
        description={guide.email}
        actions={(
          <Link className="button-link secondary-button" to={`/guides/${guide.uid}/edit`}>
            <Pencil size={17} />
            Редактировать
          </Link>
        )}
      />

      <section className="details-card">
        <dl className="details-grid">
          <div><dt>Статус доступа</dt><dd><span className={`approval-badge ${guide.isApproved ? 'approval-approved' : 'approval-pending'}`}>{guide.isApproved ? 'Одобрен' : 'Ожидает одобрения'}</span></dd></div>
          <div><dt>Уровень</dt><dd><span className={`level-badge level-${guide.level || 'unset'}`}>{GUIDE_LEVEL_LABELS[guide.level]}</span></dd></div>
          <div><dt>Телефон</dt><dd>{guide.phone || '—'}</dd></div>
          <div><dt>Telegram</dt><dd>{guide.telegramAlias || '—'}</dd></div>
          <div><dt>Проведено экскурсий</dt><dd>{guide.toursCount}</dd></div>
          <div><dt>Обновлён</dt><dd>{formatTimestamp(guide.updatedAt)}</dd></div>
        </dl>
      </section>

      {!guide.isApproved && (
        <section className="approval-zone">
          <div>
            <h2>Одобрить гида</h2>
            <p>
              После одобрения гид сможет видеть подходящие экскурсии и подавать заявки.
            </p>
            {!isGuideLevel(guide.level) && <p className="form-error">Перед одобрением назначьте уровень гида.</p>}
            {approveMutation.isError && <p className="form-error">{getErrorMessage(approveMutation.error)}</p>}
          </div>
          {isGuideLevel(guide.level) ? (
            <button
              className="approval-zone-action"
              type="button"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              <Check size={17} />
              {approveMutation.isPending ? 'Одобряем...' : 'Одобрить доступ'}
            </button>
          ) : (
            <Link className="button-link approval-zone-action" to={`/guides/${guide.uid}/edit`}>Назначить уровень</Link>
          )}
        </section>
      )}

      <section className="danger-zone">
        <div>
          <h2>Удалить доступ гида</h2>
          <p>Документ гида будет удалён. Аккаунт пользователя останется активным.</p>
          {deleteMutation.isError && <p className="form-error">{getErrorMessage(deleteMutation.error)}</p>}
        </div>
        <DeleteButton
          label={`Удалить гида «${guide.name}»?`}
          pending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutateAsync()}
        />
      </section>
    </main>
  );
}
