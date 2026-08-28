import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import ClientRoute from './components/common/ClientRoute';
import AiChatWidget from './components/common/AiChatWidget';
import { Agentation } from 'agentation';

const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const Gallery = lazy(() => import('./pages/Gallery'));
const DestinationExplorer = lazy(() => import('./pages/DestinationExplorer'));
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
      <>
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
        <AiChatWidget />
      </>
    );
  }

  if (isHomePage) {
    return (
      <>
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
        <AiChatWidget />
      </>
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
            path="/gallery"
            element={
              <ClientRoute>
                <Gallery />
              </ClientRoute>
            }
          />
          <Route
            path="/gallery/:id"
            element={
              <ClientRoute>
                <DestinationExplorer />
              </ClientRoute>
            }
          />
          <Route
            path="/destination/:id"
            element={
              <ClientRoute>
                <DestinationExplorer />
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
            path="/itinerary/:id"
            element={
              <ProtectedRoute>
                <ItineraryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itineraries/:id"
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
      <AiChatWidget />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ModalProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <Loader />
                </div>
              }
            >
              <AppLayout />
            </Suspense>
            <Agentation />
          </ModalProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
