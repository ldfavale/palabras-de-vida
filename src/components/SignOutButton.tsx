// src/components/SignOutButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Ajusta la ruta si es necesario
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Ícono de Logout

// Componente simple para el Spinner (Activity Indicator)
const Spinner: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-white" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true" // Es decorativo mientras carga
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


// *** Renombrado el componente a SignOutButton ***
export const SignOutButton: React.FC = () => {
  const { signOutUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Evitar doble click
    if (loading) return;

    setLoading(true);
    try {
      await signOutUser();
      // Navegar a login después de cerrar sesión
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      // Podrías mostrar un error si es necesario
      setLoading(false); // Asegurar que el spinner se quite si hay error
    }
    // No necesitas setLoading(false) aquí si la navegación siempre ocurre
    // y desmonta el componente. Pero añadirlo en el catch es seguro.
  };

  // No renderizar nada si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Renderizar botón con icono o spinner
  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      aria-label="Cerrar sesión" // MUY IMPORTANTE para accesibilidad
      // Ajusta los estilos para que coincidan con tu Header (padding, colores)
      // Usamos p-1.5 y rounded-full como ejemplo de botón de icono circular
      className="ml-4 p-1.5 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-70 disabled:cursor-wait transition ease-in-out duration-150 flex items-center justify-center" // flex/items/justify para centrar contenido
    >
      {loading ? (
        // Mostrar Spinner mientras carga
        <Spinner className="h-5 w-5 text-white" /> // Usamos el componente Spinner
      ) : (
        // Mostrar Icono de Logout
        <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
        // Alternativa: podrías usar ArrowLeftOnRectangleIcon si prefieres la dirección
      )}
    </button>
  );
};