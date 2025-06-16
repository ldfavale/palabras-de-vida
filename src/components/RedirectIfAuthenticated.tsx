import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Asegurate que esta ruta coincida con tu proyecto

interface Props {
  children: React.ReactNode;
  redirectTo?: string; // Permite redirigir a otra ruta distinta de "/"
}

export const RedirectIfAuthenticated = ({ children, redirectTo = '/' }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTo]);

  if (isLoading) {
    return null; // O un spinner si preferís
  }

  if (isAuthenticated) {
    return null; // Ya fue redirigido, no mostrar nada
  }

  return <>{children}</>;
};
