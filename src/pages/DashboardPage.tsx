import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarDays, Plus, Route, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import { guideKeys, listGuides } from '../entities/guide/guide.api';
import { PageHeader } from '../shared/ui/PageHeader';

export function DashboardPage() {
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });

  const cards = [
    {
      label: 'Гиды',
      value: guidesQuery.isPending ? '…' : String(guidesQuery.data?.length ?? 0),
      icon: Users,
      to: '/guides',
    },
    {
      label: 'Компании',
      value: companiesQuery.isPending ? '…' : String(companiesQuery.data?.length ?? 0),
      icon: Building2,
      to: '/companies',
    },
    { label: 'Ближайшие экскурсии', value: '—', icon: CalendarDays },
    { label: 'Нужны гиды', value: '—', icon: Route },
  ];

  return (
    <main className="page-content">
      <PageHeader
        eyebrow="Панель управления"
        title="Добрый день"
        description="Управляйте доступом гидов и базой компаний Guide Manager."
      />

      <section className="stat-grid" aria-label="Сводка">
        {cards.map(({ icon: Icon, label, to, value }) => {
          const content = (
            <>
              <Icon size={22} />
              <span>{label}</span>
              <strong>{value}</strong>
            </>
          );

          return to ? (
            <Link className="stat-card" key={label} to={to}>{content}</Link>
          ) : (
            <article className="stat-card" key={label}>{content}</article>
          );
        })}
      </section>

      <section className="quick-actions">
        <div>
          <p className="eyebrow">Быстрые действия</p>
          <h2>Добавить данные</h2>
        </div>
        <div className="quick-action-links">
          <Link className="button-link" to="/guides/new"><Plus size={17} /> Новый гид</Link>
          <Link className="button-link secondary-button" to="/companies/new"><Plus size={17} /> Новая компания</Link>
        </div>
      </section>
    </main>
  );
}
