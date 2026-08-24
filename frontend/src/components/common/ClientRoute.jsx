import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader text="Loading..." />
      </div>
    );
  }

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ClientRoute;
