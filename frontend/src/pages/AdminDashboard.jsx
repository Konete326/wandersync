import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import Loader from '@/components/common/Loader';
import { useAdminLiveAlerts } from '@/hooks/useAdminLiveAlerts';

const Dashboard = lazy(() =>
  import('@/components/dashboard').then((m) => ({ default: m.Dashboard }))
);
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminDestinationEditor = lazy(() => import('@/pages/admin/AdminDestinationEditor'));
const AdminExpenses = lazy(() => import('@/pages/admin/AdminExpenses'));
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminChangelog = lazy(() => import('@/pages/admin/AdminChangelog'));
const AdminComingSoon = lazy(() => import('@/pages/admin/AdminComingSoon'));

export default function AdminDashboard() {
  useAdminLiveAlerts();

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader text="Loading Command Center..." />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<AdminComingSoon />} />
          <Route path="/users" element={<AdminComingSoon />} />
          <Route path="/ai-analytics" element={<AdminComingSoon />} />
          <Route path="/expenses" element={<AdminExpenses />} />
          <Route path="/media" element={<AdminGallery />} />
          <Route path="/media/new" element={<AdminDestinationEditor />} />
          <Route path="/media/edit/:id" element={<AdminDestinationEditor />} />
          <Route path="/destinations/create" element={<AdminDestinationEditor />} />
          <Route path="/destinations/edit/:id" element={<AdminDestinationEditor />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="/changelog" element={<AdminChangelog />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
