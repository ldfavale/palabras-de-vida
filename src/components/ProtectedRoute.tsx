import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Asegúrate que la ruta sea correcta

// 1. Definimos las props que recibirá nuestro componente
interface ProtectedRouteProps {
  children: ReactNode; // El contenido (la página) que queremos proteger
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth(); // Usamos nuestro hook
  const location = useLocation(); // Para recordar a dónde quería ir el usuario

  // 2. Mientras verificamos el estado, mostramos algo temporal
  if (isLoading) {
    // Puedes poner un spinner o componente de carga más elaborado aquí
    return <div>Cargando sesión...</div>;
  }

  // 3. Si no está autenticado, redirigimos a la página de login
  if (!isAuthenticated) {
    // Usamos 'replace' para que el usuario no pueda volver a la ruta protegida con el botón "atrás"
    // Guardamos la ruta original en 'state' para poder redirigir de vuelta tras el login
    return <Navigate to="/login" state={{ from: location }} replace />;
    // ¡Importante! Asegúrate de tener una ruta definida para "/login"
  }

  // 4. Si está autenticado, renderizamos el contenido protegido
  return <>{children}</>; // Usamos Fragment (<></>) o simplemente devolvemos children
};