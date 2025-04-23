import React from 'react';
import { SignUpForm } from '../components/SignUpForm'; // Ajusta la ruta si es necesario

const SignUpPage: React.FC = () => {
  return (
    // Clases de Tailwind para centrar y dar altura mínima
    <div className="flex min-h-[80vh] items-center justify-center px-4">
       {/* Contenedor opcional para el formulario */}
       <div className="w-full max-w-md space-y-8">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;