import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';
import Loader from '@/components/common/Loader';
import { useAdminLiveAlerts } from '@/hooks/useAdminLiveAlerts';

const Dashboard = lazy(() => import('@/components/dashboard').then((m) => ({ default: m.Dashboard })));
const AdminGroupTours = lazy(() => import('@/pages/admin/AdminGroupTours'));
const AdminGroupTourEditor = lazy(() => import('@/pages/admin/AdminGroupTourEditor'));
const AdminTourPOSTerminal = lazy(() => import('@/pages/admin/AdminTourPOSTerminal'));
const AdminTrips = lazy(() => import('@/pages/admin/AdminTrips'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCommunity = lazy(() => import('@/pages/admin/AdminCommunity'));
const AdminCountries = lazy(() => import('@/pages/admin/AdminCountries'));
const AdminCountryEditor = lazy(() => import('@/pages/admin/AdminCountryEditor'));
const AdminSpots = lazy(() => import('@/pages/admin/AdminSpots'));
const AdminSpotEditor = lazy(() => import('@/pages/admin/AdminSpotEditor'));
const AdminHotels = lazy(() => import('@/pages/admin/AdminHotels'));
const AdminHotelEditor = lazy(() => import('@/pages/admin/AdminHotelEditor'));
const AdminVehicles = lazy(() => import('@/pages/admin/AdminVehicles'));
const AdminVehicleEditor = lazy(() => import('@/pages/admin/AdminVehicleEditor'));
const AdminFlights = lazy(() => import('@/pages/admin/AdminFlights'));
const AdminFlightEditor = lazy(() => import('@/pages/admin/AdminFlightEditor'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminDestinationEditor = lazy(() => import('@/pages/admin/AdminDestinationEditor'));
const AdminAiAnalytics = lazy(() => import('@/pages/admin/AdminAiAnalytics'));
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
          <Route path="/group-tours" element={<AdminGroupTours />} />
          <Route path="/group-tours/new" element={<AdminGroupTourEditor />} />
          <Route path="/group-tours/edit/:id" element={<AdminGroupTourEditor />} />
          <Route path="/tour-pos" element={<AdminTourPOSTerminal />} />
          <Route path="/trips" element={<AdminTrips />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/community" element={<AdminCommunity />} />

          {/* Travel Catalog & Fleet Suite */}
          <Route path="/countries" element={<AdminCountries />} />
          <Route path="/countries/new" element={<AdminCountryEditor />} />
          <Route path="/countries/edit/:id" element={<AdminCountryEditor />} />

          <Route path="/spots" element={<AdminSpots />} />
          <Route path="/spots/new" element={<AdminSpotEditor />} />
          <Route path="/spots/edit/:id" element={<AdminSpotEditor />} />

          <Route path="/hotels" element={<AdminHotels />} />
          <Route path="/hotels/new" element={<AdminHotelEditor />} />
          <Route path="/hotels/edit/:id" element={<AdminHotelEditor />} />

          <Route path="/vehicles" element={<AdminVehicles />} />
          <Route path="/vehicles/new" element={<AdminVehicleEditor />} />
          <Route path="/vehicles/edit/:id" element={<AdminVehicleEditor />} />

          <Route path="/flights" element={<AdminFlights />} />
          <Route path="/flights/new" element={<AdminFlightEditor />} />
          <Route path="/flights/edit/:id" element={<AdminFlightEditor />} />

          <Route path="/media" element={<AdminGallery />} />
          <Route path="/media/new" element={<AdminDestinationEditor />} />
          <Route path="/media/edit/:id" element={<AdminDestinationEditor />} />
          <Route path="/destinations/create" element={<AdminDestinationEditor />} />
          <Route path="/destinations/edit/:id" element={<AdminDestinationEditor />} />

          {/* AI, Expenses & System */}
          <Route path="/ai-analytics" element={<AdminAiAnalytics />} />
          <Route path="/expenses" element={<AdminExpenses />} />
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
