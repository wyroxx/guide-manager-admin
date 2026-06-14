// Sidebar.tsx
// Sidebar with stats and actions.
import React from 'react';
import { Calendar, Plus, Users, BarChart3, BanIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Sidebar.css';

interface SidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  stats: {
    totalExcursions: number;
  };
  onCreateExcursion: () => void;
  onManageUsers: () => void;
  onBanList:() => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  stats,
  onCreateExcursion,
  onManageUsers,
  onBanList
}) => {
  const { t } = useLanguage();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Excursion Manager</h1>
      </div>

      <div className="sidebar-actions">
        <button onClick={onCreateExcursion} className="create-tour-btn">
          <Plus size={16} />
          {t('create_excursion')}
        </button>

        <button onClick={onBanList} className="ban-list-btn">
          <BanIcon size={16} />
          {t('ban_list')}
        </button>

        <button onClick={onManageUsers} className="manage-guides-btn">
          <Users size={16} />
          {t('manage_users')}
        </button>
      </div>

      <div className="sidebar-section">
        <h3><Calendar size={16} /> {t('calendar')}</h3>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="date-picker"
        />
      </div>

      <div className="sidebar-section">
        <h3>{t('view_mode')}</h3>
        <div className="view-modes">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`view-mode-btn ${viewMode === mode ? 'active' : ''}`}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3><BarChart3 size={16} /> {t('statistics')}</h3>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Всего экскурсий</span>
            <span className="stat-value">{stats.totalExcursions}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
