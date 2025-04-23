import React from 'react';
import { LoginForm } from '../components/LoginForm'; // Ajusta la ruta si es necesario

const LoginPage: React.FC = () => {
  return (
    // Clases de Tailwind para centrar y dar altura mínima
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      {/* Contenedor opcional para el formulario con padding, sombra, etc. */}
      <div className="w-full max-w-md space-y-8">
        {/* Aquí puedes añadir un logo o título si lo deseas */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;