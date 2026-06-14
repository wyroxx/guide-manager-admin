import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { excursionKeys, getExcursion, updateExcursion } from '../entities/excursion/excursion.api';
import { type ExcursionInput } from '../entities/excursion/excursion.types';
import { useAuth } from '../features/auth/AuthProvider';
import { ExcursionForm } from '../features/excursion-form/ExcursionForm';
import { getErrorMessage } from '../shared/lib/errors';
import { toDateTimeLocalValue } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function ExcursionEditPage() {
  const { excursionId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const excursionQuery = useQuery({
    queryKey: excursionKeys.detail(excursionId),
    queryFn: () => getExcursion(excursionId),
    enabled: Boolean(excursionId),
  });
  const mutation = useMutation({
    mutationFn: async (input: ExcursionInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await updateExcursion(excursionId, input, user.uid);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: excursionKeys.all }),
        queryClient.invalidateQueries({ queryKey: excursionKeys.detail(excursionId) }),
      ]);
      navigate(`/excursions/${excursionId}`, { replace: true });
    },
  });

  if (excursionQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (excursionQuery.isError) return <main className="page-content"><ErrorState message={getErrorMessage(excursionQuery.error)} /></main>;
  if (!excursionQuery.data) return <main className="page-content"><ErrorState message="Экскурсия не найдена." /></main>;

  const excursion = excursionQuery.data;

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo={`/excursions/${excursionId}`}
        eyebrow="Карточка экскурсии"
        title="Редактировать экскурсию"
        description={excursion.title}
      />
      <section className="form-card">
        <ExcursionForm
          mode="edit"
          initialValues={{
            title: excursion.title,
            companyId: excursion.companyId,
            startDate: toDateTimeLocalValue(excursion.startDate),
            endDate: toDateTimeLocalValue(excursion.endDate),
            route: excursion.route,
            meetingPlace: excursion.meetingPlace,
            requiredGuides: excursion.requiredGuides,
            requiredLevels: excursion.requiredLevels,
            maxParticipants: excursion.maxParticipants,
            hasLunch: excursion.hasLunch,
            hasMasterclass: excursion.hasMasterclass,
            excursionType: excursion.excursionType,
            paymentStatus: excursion.paymentStatus,
          }}
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => mutation.mutateAsync(values)}
        />
      </section>
    </main>
  );
}
