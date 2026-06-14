import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { applicationKeys, listApplications } from '../../entities/application/application.api';

const navigation = [
  { to: '/', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/guides', label: 'Гиды', icon: Users, end: false },
  { to: '/companies', label: 'Компании', icon: Building2, end: false },
  { to: '/excursions', label: 'Экскурсии', icon: CalendarDays, end: false },
  { to: '/applications', label: 'Заявки', icon: ClipboardCheck, end: false },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const applicationsQuery = useQuery({ queryKey: applicationKeys.all, queryFn: listApplications });
  const pendingApplications = (applicationsQuery.data ?? []).filter(
    (application) => application.status === 'pending',
  ).length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-heading">
          <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}>
            Guide Manager
          </NavLink>
          <button
            className="mobile-close"
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Основная навигация">
          {navigation.map(({ end, icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={end}
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={19} />
              {label}
              {to === '/applications' && pendingApplications > 0 && (
                <span className="nav-badge">{pendingApplications}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-account">
          <span>{user?.email}</span>
          <button className="sidebar-logout" type="button" onClick={() => void logout()}>
            <LogOut size={17} />
            Выйти
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="app-main">
        <header className="mobile-header">
          <button type="button" aria-label="Открыть меню" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
          <span>Guide Manager</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
