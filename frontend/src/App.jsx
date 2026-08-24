import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Agentation } from 'agentation';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import ClientRoute from './components/common/ClientRoute';

const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Community = lazy(() => import('./pages/Community'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const ItineraryDetails = lazy(() => import('./pages/ItineraryDetails'));
const MyTrips = lazy(() => import('./pages/MyTrips'));
const SharedTrip = lazy(() => import('./pages/SharedTrip'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  if (isAdminRoute) {
    return (
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  if (isHomePage) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <ClientRoute>
              <Home />
            </ClientRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route
            path="/how-it-works"
            element={
              <ClientRoute>
                <HowItWorks />
              </ClientRoute>
            }
          />
          <Route
            path="/features"
            element={
              <ClientRoute>
                <Features />
              </ClientRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ClientRoute>
                <Pricing />
              </ClientRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ClientRoute>
                <Community />
              </ClientRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <ItineraryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-trips"
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share/:shareSlug"
            element={
              <ClientRoute>
                <SharedTrip />
              </ClientRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader text="Loading Lumora..." />
              </div>
            }
          >
            <AppLayout />
          </Suspense>
          {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
