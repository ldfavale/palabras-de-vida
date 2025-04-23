import React from 'react';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'; // Ajusta la ruta si es necesario

const ForgotPasswordPage: React.FC = () => {
  return (
    // Clases de Tailwind para centrar y dar altura mínima
    <div className="flex min-h-[80vh] items-center justify-center px-4">
       {/* Contenedor opcional para el formulario */}
       <div className="w-full max-w-md space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;