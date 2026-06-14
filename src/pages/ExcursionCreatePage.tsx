import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createExcursion, excursionKeys } from '../entities/excursion/excursion.api';
import { type ExcursionInput } from '../entities/excursion/excursion.types';
import { useAuth } from '../features/auth/AuthProvider';
import { ExcursionForm } from '../features/excursion-form/ExcursionForm';
import { getErrorMessage } from '../shared/lib/errors';
import { PageHeader } from '../shared/ui/PageHeader';

export function ExcursionCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: ExcursionInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      return createExcursion(input, user.uid);
    },
    onSuccess: async (excursionId) => {
      await queryClient.invalidateQueries({ queryKey: excursionKeys.all });
      navigate(`/excursions/${excursionId}`, { replace: true });
    },
  });

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/excursions"
        eyebrow="Новое событие"
        title="Создать экскурсию"
        description="Свободные места рассчитываются автоматически по числу назначенных гидов."
      />
      <section className="form-card">
        <ExcursionForm
          mode="create"
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => { await mutation.mutateAsync(values); }}
        />
      </section>
    </main>
  );
}
