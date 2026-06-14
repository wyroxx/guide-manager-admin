import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { PublicOnlyRoute } from '../features/auth/PublicOnlyRoute';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { CompaniesPage } from '../pages/CompaniesPage';
import { CompanyCreatePage } from '../pages/CompanyCreatePage';
import { CompanyDetailsPage } from '../pages/CompanyDetailsPage';
import { CompanyEditPage } from '../pages/CompanyEditPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExcursionCreatePage } from '../pages/ExcursionCreatePage';
import { ExcursionDetailsPage } from '../pages/ExcursionDetailsPage';
import { ExcursionEditPage } from '../pages/ExcursionEditPage';
import { ExcursionsPage } from '../pages/ExcursionsPage';
import { GuideCreatePage } from '../pages/GuideCreatePage';
import { GuideDetailsPage } from '../pages/GuideDetailsPage';
import { GuideEditPage } from '../pages/GuideEditPage';
import { GuidesPage } from '../pages/GuidesPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AppLayout } from '../shared/ui/AppLayout';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />

          <Route path="guides" element={<GuidesPage />} />
          <Route path="guides/new" element={<GuideCreatePage />} />
          <Route path="guides/:uid" element={<GuideDetailsPage />} />
          <Route path="guides/:uid/edit" element={<GuideEditPage />} />

          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<CompanyCreatePage />} />
          <Route path="companies/:companyId" element={<CompanyDetailsPage />} />
          <Route path="companies/:companyId/edit" element={<CompanyEditPage />} />

          <Route path="excursions" element={<ExcursionsPage />} />
          <Route path="excursions/new" element={<ExcursionCreatePage />} />
          <Route path="excursions/:excursionId" element={<ExcursionDetailsPage />} />
          <Route path="excursions/:excursionId/edit" element={<ExcursionEditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
