import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { companyKeys, deleteCompany, getCompany } from '../entities/company/company.api';
import { CompanyBlacklist } from '../features/company-blacklist/CompanyBlacklist';
import { getErrorMessage } from '../shared/lib/errors';
import { formatTimestamp } from '../shared/lib/format';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { DeleteButton } from '../shared/ui/DeleteButton';
import { PageHeader } from '../shared/ui/PageHeader';

export function CompanyDetailsPage() {
  const { companyId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const companyQuery = useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
    enabled: Boolean(companyId),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteCompany(companyId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: companyKeys.detail(companyId) });
      await queryClient.invalidateQueries({ queryKey: companyKeys.all });
      navigate('/companies', { replace: true });
    },
  });

  if (companyQuery.isPending) return <main className="page-content"><PageLoading /></main>;
  if (companyQuery.isError) return <main className="page-content"><ErrorState message={getErrorMessage(companyQuery.error)} onRetry={() => void companyQuery.refetch()} /></main>;
  if (!companyQuery.data) return <main className="page-content"><ErrorState message="Компания не найдена." /></main>;

  const company = companyQuery.data;

  return (
    <main className="page-content page-narrow">
      <PageHeader
        backTo="/companies"
        eyebrow="Карточка компании"
        title={company.name}
        description={company.contactName || 'Контактное лицо не указано'}
        actions={(
          <Link className="button-link secondary-button" to={`/companies/${company.id}/edit`}>
            <Pencil size={17} />
            Редактировать
          </Link>
        )}
      />

      <section className="details-card">
        <dl className="details-grid">
          <div><dt>Телефон</dt><dd>{company.phone || '—'}</dd></div>
          <div><dt>Telegram</dt><dd>{company.telegramAlias || '—'}</dd></div>
          <div><dt>Гидов в blacklist</dt><dd>{company.banList.length}</dd></div>
          <div><dt>Обновлена</dt><dd>{formatTimestamp(company.updatedAt)}</dd></div>
          <div className="details-wide"><dt>Заметки</dt><dd className="preserve-lines">{company.notes || '—'}</dd></div>
        </dl>
      </section>

      <CompanyBlacklist companyId={company.id} banList={company.banList} />

      <section className="danger-zone">
        <div>
          <h2>Удалить компанию</h2>
          <p>Удаление невозможно отменить. Связанные экскурсии автоматически не изменятся.</p>
          {deleteMutation.isError && <p className="form-error">{getErrorMessage(deleteMutation.error)}</p>}
        </div>
        <DeleteButton
          label={`Удалить компанию «${company.name}»?`}
          pending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutateAsync()}
        />
      </section>
    </main>
  );
}
