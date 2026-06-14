import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Search, UserMinus, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  addGuideToCompanyBanList,
  companyKeys,
  removeGuideFromCompanyBanList,
} from '../../entities/company/company.api';
import { guideKeys, listGuides } from '../../entities/guide/guide.api';
import { useAuth } from '../auth/AuthProvider';
import { getErrorMessage } from '../../shared/lib/errors';

interface CompanyBlacklistProps {
  companyId: string;
  banList: string[];
}

export function CompanyBlacklist({ companyId, banList }: CompanyBlacklistProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });
  const normalizedBanList = useMemo(
    () => new Set(banList.map((email) => email.toLowerCase())),
    [banList],
  );

  async function refreshCompany() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) }),
      queryClient.invalidateQueries({ queryKey: companyKeys.all }),
    ]);
  }

  const addMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await addGuideToCompanyBanList(companyId, email, user.uid);
    },
    onSuccess: refreshCompany,
  });
  const removeMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      await removeGuideFromCompanyBanList(companyId, email, user.uid);
    },
    onSuccess: refreshCompany,
  });

  const matchingGuides = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('ru');
    if (!needle) return [];

    return (guidesQuery.data ?? [])
      .filter((guide) => !normalizedBanList.has(guide.email.toLowerCase()))
      .filter((guide) =>
        `${guide.name} ${guide.email}`.toLocaleLowerCase('ru').includes(needle),
      )
      .slice(0, 8);
  }, [guidesQuery.data, normalizedBanList, search]);

  const guideByEmail = useMemo(
    () => new Map((guidesQuery.data ?? []).map((guide) => [guide.email.toLowerCase(), guide])),
    [guidesQuery.data],
  );
  const mutationError = addMutation.error ?? removeMutation.error;

  return (
    <section className="blacklist-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ограничения</p>
          <h2>Blacklist гидов</h2>
          <p>Эти гиды не смогут видеть или брать экскурсии компании.</p>
        </div>
        <span className="count-badge"><Ban size={15} /> {banList.length}</span>
      </div>

      <label className="search-field blacklist-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Найти гида по имени или email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {search.trim() && (
        <div className="blacklist-results">
          {guidesQuery.isPending && <span className="inline-status">Загружаем гидов...</span>}
          {guidesQuery.isError && <span className="field-error">{getErrorMessage(guidesQuery.error)}</span>}
          {guidesQuery.isSuccess && matchingGuides.length === 0 && (
            <span className="inline-status">Подходящих гидов не найдено.</span>
          )}
          {matchingGuides.map((guide) => (
            <div className="blacklist-row" key={guide.uid}>
              <div>
                <strong>{guide.name}</strong>
                <span>{guide.email}</span>
              </div>
              <button
                className="secondary-button compact-button"
                type="button"
                disabled={addMutation.isPending}
                onClick={() => addMutation.mutate(guide.email)}
              >
                <UserPlus size={16} />
                Добавить
              </button>
            </div>
          ))}
        </div>
      )}

      {mutationError && <p className="form-error" role="alert">{getErrorMessage(mutationError)}</p>}

      <div className="blacklist-current">
        {banList.length === 0 ? (
          <div className="inline-empty">Blacklist пока пуст.</div>
        ) : (
          banList.map((email) => {
            const guide = guideByEmail.get(email.toLowerCase());
            return (
              <div className="blacklist-row" key={email}>
                <div>
                  <strong>{guide?.name ?? 'Гид не найден в коллекции'}</strong>
                  <span>{email}</span>
                </div>
                <button
                  className="danger-button secondary-button compact-button"
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(email)}
                >
                  <UserMinus size={16} />
                  Удалить
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
