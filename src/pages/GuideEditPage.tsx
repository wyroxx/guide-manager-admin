import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getGuide, guideKeys, updateGuide } from '../entities/guide/guide.api';
import { isGuideLevel, type GuideInput } from '../entities/guide/guide.types';
import { useAuth } from '../features/auth/AuthProvider';
import { GuideForm } from '../features/guide-form/GuideForm';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function GuideEditPage() {
  const { uid = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const guideQuery = useQuery({
    queryKey: guideKeys.detail(uid),
    queryFn: () => getGuide(uid),
    enabled: Boolean(uid),
  });
  const mutation = useMutation({
    mutationFn: async (input: GuideInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await updateGuide(uid, input, user.uid);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: guideKeys.all }),
        queryClient.invalidateQueries({ queryKey: guideKeys.detail(uid) }),
      ]);
      navigate(`/guides/${uid}`, { replace: true });
    },
  });

  if (guideQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (guideQuery.isError) return <main className="page-content"><ErrorState message={getErrorMessage(guideQuery.error)} /></main>;
  if (!guideQuery.data) return <main className="page-content"><ErrorState message="Гид не найден." /></main>;

  const guide = guideQuery.data;

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo={`/guides/${uid}`}
        eyebrow="Профиль гида"
        title="Редактировать гида"
        description={guide.email}
      />
      <section className="form-card">
        <GuideForm
          mode="edit"
          initialValues={{
            uid: guide.uid,
            email: guide.email,
            name: guide.name,
            phone: guide.phone ?? '',
            telegramAlias: guide.telegramAlias ?? '',
            level: isGuideLevel(guide.level) ? guide.level : 'trainee',
          }}
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => mutation.mutateAsync(values)}
        />
      </section>
    </main>
  );
}
