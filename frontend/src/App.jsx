import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';

const Home = lazy(() => import('./pages/Home'));
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

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader text="Loading..." /></div>}>
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      ) : (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<ItineraryDetails />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/share/:shareSlug" element={<SharedTrip />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <AppLayout />
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
