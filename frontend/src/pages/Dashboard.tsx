// Dashboard.tsx
// Main page with calendar, sidebar and modals.
import { useState } from 'react';
import { useQuery } from 'react-query';
import CalendarGrid from '../components/CalendarGrid';
import CreateExcursionModal from '../components/CreateExcursionModal';
import ManageUsersModal from '../components/ManageUsersModal';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchExcursions, Excursion } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [, setSelectedExcursion] = useState<Excursion | null>(null);
  const [createExcursionOpen, setCreateExcursionOpen] = useState(false);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [, setBanListOpen] = useState(false);

  const { data: excursions = [], isLoading: excursionsLoading } = useQuery(
    'excursions',
    fetchExcursions,
    { refetchInterval: 30000 }
  );

  const stats = {
    totalExcursions: excursions.length
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h1>
        </div>
      </div>

      <div className="dashboard-body">
        <Sidebar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stats={stats}
          onCreateExcursion={() => setCreateExcursionOpen(true)}
          onManageUsers={() => setManageUsersOpen(true)}
          onBanList={()=>setBanListOpen(true)}
        />

        <main className="main-content">
          <CalendarGrid
            selectedDate={selectedDate}
            excursions={excursions}
            onExcursionClick={setSelectedExcursion}
            onDateClick={setSelectedDate}
            isLoading={excursionsLoading}
          />
        </main>
      </div>

      <CreateExcursionModal
        open={createExcursionOpen}
        onOpenChange={setCreateExcursionOpen}
      />

      <ManageUsersModal
        open={manageUsersOpen}
        onOpenChange={setManageUsersOpen}
      />

      {/* <BanListModal
        open={BanListOpen}
        onOpenChange={setBanListOpen}
      /> */}
    </div>
  );
}
