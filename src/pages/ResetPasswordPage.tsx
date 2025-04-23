import React from 'react';
import { ResetPasswordForm } from '../components/ResetPasswordForm'; // Ajusta la ruta si es necesario

const ResetPasswordPage: React.FC = () => {
  return (
    // Clases de Tailwind para centrar y dar altura mínima
    <div className="flex min-h-[80vh] items-center justify-center px-4">
       {/* Contenedor opcional para el formulario */}
       <div className="w-full max-w-md space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
