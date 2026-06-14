import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarDays, ClipboardCheck, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyKeys, listCompanies } from '../entities/company/company.api';
import { applicationKeys, listApplications } from '../entities/application/application.api';
import { excursionKeys, listExcursions } from '../entities/excursion/excursion.api';
import { guideKeys, listGuides } from '../entities/guide/guide.api';
import { PageHeader } from '../shared/ui/PageHeader';

export function DashboardPage() {
  const guidesQuery = useQuery({ queryKey: guideKeys.all, queryFn: listGuides });
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });
  const excursionsQuery = useQuery({ queryKey: excursionKeys.all, queryFn: listExcursions });
  const applicationsQuery = useQuery({ queryKey: applicationKeys.all, queryFn: listApplications });
  const upcomingExcursions = (excursionsQuery.data ?? []).filter(
    (excursion) => excursion.startDate && excursion.startDate.toMillis() >= Date.now(),
  );
  const pendingApplications = (applicationsQuery.data ?? []).filter(
    (application) => application.status === 'pending',
  );

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
    {
      label: 'Ближайшие экскурсии',
      value: excursionsQuery.isPending ? '…' : String(upcomingExcursions.length),
      icon: CalendarDays,
      to: '/excursions',
    },
    {
      label: 'Новые заявки',
      value: applicationsQuery.isPending ? '…' : String(pendingApplications.length),
      icon: ClipboardCheck,
      to: '/applications',
    },
  ];

  return (
    <main className="page-content">
      <PageHeader
        eyebrow="Панель управления"
        title="Добрый день"
        description="Управляйте гидами, компаниями, расписанием экскурсий и новыми заявками."
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
          <Link className="button-link secondary-button" to="/excursions/new"><Plus size={17} /> Новая экскурсия</Link>
          <Link className="button-link secondary-button" to="/applications"><ClipboardCheck size={17} /> Открыть заявки</Link>
        </div>
      </section>
    </main>
  );
}
