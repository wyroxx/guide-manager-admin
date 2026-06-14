import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { companyKeys, getCompany, updateCompany } from '../entities/company/company.api';
import { type CompanyInput } from '../entities/company/company.types';
import { useAuth } from '../features/auth/AuthProvider';
import { CompanyForm } from '../features/company-form/CompanyForm';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function CompanyEditPage() {
  const { companyId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const companyQuery = useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
    enabled: Boolean(companyId),
  });
  const mutation = useMutation({
    mutationFn: async (input: CompanyInput) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await updateCompany(companyId, input, user.uid);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyKeys.all }),
        queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) }),
      ]);
      navigate(`/companies/${companyId}`, { replace: true });
    },
  });

  if (companyQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (companyQuery.isError) return <main className="page-content"><ErrorState message={getErrorMessage(companyQuery.error)} /></main>;
  if (!companyQuery.data) return <main className="page-content"><ErrorState message="Компания не найдена." /></main>;

  const company = companyQuery.data;

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo={`/companies/${companyId}`}
        eyebrow="Карточка компании"
        title="Редактировать компанию"
        description={company.name}
      />
      <section className="form-card">
        <CompanyForm
          mode="edit"
          initialValues={{
            name: company.name,
            contactName: company.contactName ?? '',
            phone: company.phone ?? '',
            telegramAlias: company.telegramAlias ?? '',
            notes: company.notes ?? '',
          }}
          pending={mutation.isPending}
          serverError={mutation.error ? getErrorMessage(mutation.error) : null}
          onSubmit={async (values) => mutation.mutateAsync(values)}
        />
      </section>
    </main>
  );
}
