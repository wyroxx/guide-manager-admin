import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createGuide, guideKeys } from '../entities/guide/guide.api';
import { type GuideInput } from '../entities/guide/guide.types';
import { useAuth } from '../features/auth/AuthProvider';
import { GuideForm } from '../features/guide-form/GuideForm';
import { getErrorMessage } from '../shared/lib/errors';
import { PageHeader } from '../shared/ui/PageHeader';

export function GuideCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: GuideInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await createGuide(input, user.uid);
    },
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: guideKeys.all });
      navigate(`/guides/${input.uid}`, { replace: true });
    },
  });

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/guides"
        eyebrow="Новый доступ"
        title="Добавить гида"
        description="Создаётся документ guides/{uid}. Firebase Auth аккаунт должен уже существовать."
      />
      <section className="form-card">
        <GuideForm
          mode="create"
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => mutation.mutateAsync(values)}
        />
      </section>
    </main>
  );
}
