import { useQuery } from '@tanstack/react-query';
import { Building2, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function CompaniesPage() {
  const [search, setSearch] = useState('');
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });

  const filteredCompanies = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('ru');
    if (!needle) return companiesQuery.data ?? [];

    return (companiesQuery.data ?? []).filter((company) =>
      `${company.name} ${company.contactName ?? ''}`.toLocaleLowerCase('ru').includes(needle),
    );
  }, [companiesQuery.data, search]);

  return (
    <main className="page-content">
      <PageHeader
        eyebrow="Заказчики"
        title="Компании"
        description="Контакты компаний-заказчиков и настройки доступа гидов."
        actions={(
          <Link className="button-link" to="/companies/new">
            <Plus size={18} />
            Добавить компанию
          </Link>
        )}
      />

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Поиск по компании или контакту"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="result-count">Найдено: {filteredCompanies.length}</span>
      </div>

      {companiesQuery.isPending && <PageLoading />}
      {companiesQuery.isError && (
        <ErrorState
          message={getErrorMessage(companiesQuery.error)}
          onRetry={() => void companiesQuery.refetch()}
        />
      )}

      {companiesQuery.isSuccess && filteredCompanies.length === 0 && (
        <div className="empty-state">
          <Building2 size={30} />
          <h2>{search ? 'Ничего не найдено' : 'Компаний пока нет'}</h2>
          <p>{search ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первую компанию-заказчика.'}</p>
        </div>
      )}

      {companiesQuery.isSuccess && filteredCompanies.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Компания</th>
                <th>Контактное лицо</th>
                <th>Телефон</th>
                <th>Blacklist</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <Link className="entity-link" to={`/companies/${company.id}`}>{company.name}</Link>
                    {company.telegramAlias && <span className="cell-secondary">{company.telegramAlias}</span>}
                  </td>
                  <td>{company.contactName || '—'}</td>
                  <td>{company.phone || '—'}</td>
                  <td>{company.banList.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
