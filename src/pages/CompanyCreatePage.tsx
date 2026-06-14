import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyKeys, createCompany } from '../entities/company/company.api';
import { type CompanyInput } from '../entities/company/company.types';
import { useAuth } from '../features/auth/AuthProvider';
import { CompanyForm } from '../features/company-form/CompanyForm';
import { getErrorMessage } from '../shared/lib/errors';
import { PageHeader } from '../shared/ui/PageHeader';

export function CompanyCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (input: CompanyInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      return createCompany(input, user.uid);
    },
    onSuccess: async (companyId) => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all });
      navigate(`/companies/${companyId}`, { replace: true });
    },
  });

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/companies"
        eyebrow="Новый заказчик"
        title="Добавить компанию"
        description="Blacklist создаётся пустым и настраивается отдельно."
      />
      <section className="form-card">
        <CompanyForm
          mode="create"
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => { await mutation.mutateAsync(values); }}
        />
      </section>
    </main>
  );
}
