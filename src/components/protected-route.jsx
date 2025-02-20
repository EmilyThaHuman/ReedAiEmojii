import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/lib/store/auth-store';

export function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
} 