import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { approveGuide, guideKeys, listGuides } from '../entities/guide/guide.api';
import { GUIDE_LEVEL_LABELS, isGuideLevel } from '../entities/guide/guide.types';
import { useAuth } from '../features/auth/AuthProvider';
import { getErrorMessage } from '../shared/lib/errors';
import { ErrorState, PageLoading } from '../shared/ui/AsyncState';
import { PageHeader } from '../shared/ui/PageHeader';

export function GuidesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });
  const approveMutation = useMutation({
    mutationFn: async (uid: string) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await approveGuide(uid, user.uid);
    },
    onSuccess: async (_, uid) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: guideKeys.all }),
        queryClient.invalidateQueries({ queryKey: guideKeys.detail(uid) }),
      ]);
    },
  });

  const filteredGuides = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('ru');
    if (!needle) return guidesQuery.data ?? [];

    return (guidesQuery.data ?? []).filter((guide) =>
      `${guide.name} ${guide.email}`.toLocaleLowerCase('ru').includes(needle),
    );
  }, [guidesQuery.data, search]);

  return (
    <main className="page-content">
      <PageHeader
        eyebrow="Команда"
        title="Гиды"
        description="Заявки на доступ, допущенные пользователи Flutter-приложения и их уровни."
        actions={(
          <Link className="button-link" to="/guides/new">
            <Plus size={18} />
            Добавить гида
          </Link>
        )}
      />

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Поиск по имени или email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="result-count">Найдено: {filteredGuides.length}</span>
      </div>

      {guidesQuery.isPending && <PageLoading />}
      {guidesQuery.isError && (
        <ErrorState
          message={getErrorMessage(guidesQuery.error)}
          onRetry={() => void guidesQuery.refetch()}
        />
      )}
      {approveMutation.isError && <p className="form-error" role="alert">{getErrorMessage(approveMutation.error)}</p>}

      {guidesQuery.isSuccess && filteredGuides.length === 0 && (
        <div className="empty-state">
          <Users size={30} />
          <h2>{search ? 'Ничего не найдено' : 'Гидов пока нет'}</h2>
          <p>{search ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первого допущенного гида.'}</p>
        </div>
      )}

      {guidesQuery.isSuccess && filteredGuides.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Гид</th>
                <th>Статус</th>
                <th>Уровень</th>
                <th>Экскурсий</th>
                <th>Контакты</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuides.map((guide) => (
                <tr key={guide.uid}>
                  <td>
                    <Link className="entity-link" to={`/guides/${guide.uid}`}>{guide.name}</Link>
                    <span className="cell-secondary">{guide.email}</span>
                  </td>
                  <td>
                    <span className={`approval-badge ${guide.isApproved ? 'approval-approved' : 'approval-pending'}`}>
                      {guide.isApproved ? 'Одобрен' : 'Ожидает'}
                    </span>
                  </td>
                  <td><span className={`level-badge level-${guide.level || 'unset'}`}>{GUIDE_LEVEL_LABELS[guide.level]}</span></td>
                  <td>{guide.toursCount}</td>
                  <td>
                    <span>{guide.phone || '—'}</span>
                    {guide.telegramAlias && <span className="cell-secondary">{guide.telegramAlias}</span>}
                  </td>
                  <td>
                    {guide.isApproved ? '—' : isGuideLevel(guide.level) ? (
                      <button
                        className="compact-button"
                        type="button"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(guide.uid)}
                      >
                        <Check size={15} />
                        Одобрить
                      </button>
                    ) : (
                      <Link className="inline-link" to={`/guides/${guide.uid}/edit`}>Назначить уровень</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
