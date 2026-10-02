import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
export default function ProtectedRoute({ required = true }) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (!required) return <Outlet />;
  if (loading) return <section className="placeholder container"><p role="status">Checking your profile…</p></section>;
  if (error) return <section className="placeholder container"><h1>PROFILE UNAVAILABLE</h1><p role="alert">{error}</p><Button onClick={refresh}>Try again</Button><Button to="/login" variant="secondary">Open login</Button></section>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
