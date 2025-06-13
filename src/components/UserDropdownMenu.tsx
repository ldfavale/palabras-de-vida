import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Ajusta la ruta según tu estructura
import { UserIcon } from '@heroicons/react/24/outline'

interface UserDropdownMenuProps {
  className?: string;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOutUser, isAuthenticated } = useAuth();

  // Obtener email del usuario
  const userEmail = user?.attributes?.email || user?.username || 'Usuario';

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar dropdown al hacer click en un link
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Si no está autenticado, no mostrar el menú
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón del menú con icono de usuario */}
      <button
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E4C97A] hover:bg-[#d1b86a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E4C97A] focus:ring-offset-2 shadow-lg"
  aria-label="Menú de usuario"
  aria-expanded={isOpen}
  aria-haspopup="true"
>
  <UserIcon className="w-5 h-5 text-white" />
</button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in duration-200">
          {/* Email del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userEmail}
            </p>
            <p className="text-xs text-gray-500">Cuenta activa</p>
          </div>

          {/* Enlaces del menú */}
          <div className="py-1">
            {/* Link a Crear Usuario */}
            <Link
              to="/users/new"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
            >
              <svg
                className="w-4 h-4 mr-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Crear Usuario
            </Link>

            {/* Link a Crear Producto */}
            <Link
              to="/products/new"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
            >
              <svg
                className="w-4 h-4 mr-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Crear Producto
            </Link>

            {/* Link a Tienda */}
            <Link
              to="/tienda"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
            >
              <svg
                className="w-4 h-4 mr-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Tienda
            </Link>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Cerrar Sesión */}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};