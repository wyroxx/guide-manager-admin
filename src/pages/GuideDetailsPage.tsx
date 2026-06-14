import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteGuide, getGuide, guideKeys } from '../entities/guide/guide.api';
import { GUIDE_LEVEL_LABELS } from '../entities/guide/guide.types';
import { getErrorMessage } from '../shared/lib/errors';
import { formatTimestamp } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { DeleteButton } from '../shared/ui/DeleteButton';
import { PageHeader } from '../shared/ui/PageHeader';

export function GuideDetailsPage() {
  const { uid = '' } = useParams();
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

  if (guideQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (guideQuery.isError) {
    return <main className="page-content"><ErrorState message={getErrorMessage(guideQuery.error)} onRetry={() => void guideQuery.refetch()} /></main>;
  }
  if (!guideQuery.data) {
    return <main className="page-content"><ErrorState message="Гид с таким UID не найден." /></main>;
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
          <div><dt>UID</dt><dd className="mono-value">{guide.uid}</dd></div>
          <div><dt>Уровень</dt><dd><span className={`level-badge level-${guide.level}`}>{GUIDE_LEVEL_LABELS[guide.level]}</span></dd></div>
          <div><dt>Телефон</dt><dd>{guide.phone || '—'}</dd></div>
          <div><dt>Telegram</dt><dd>{guide.telegramAlias || '—'}</dd></div>
          <div><dt>Проведено экскурсий</dt><dd>{guide.toursCount}</dd></div>
          <div><dt>Обновлён</dt><dd>{formatTimestamp(guide.updatedAt)}</dd></div>
        </dl>
      </section>

      <section className="danger-zone">
        <div>
          <h2>Удалить доступ гида</h2>
          <p>Документ гида будет удалён. Firebase Auth аккаунт останется активным.</p>
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
