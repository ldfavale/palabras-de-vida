import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { SignUpInput } from 'aws-amplify/auth'; // Importar tipo

export const SignUpForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Añade aquí más estados si necesitas más atributos
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUpUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const signUpInput: SignUpInput = {
      username,
      password,
      options: {
        userAttributes: { email },
        // autoSignIn: true // Considera si quieres auto-login tras confirmar
      }
    };

    try {
      await signUpUser(signUpInput);
      navigate(`/confirm-signup?username=${encodeURIComponent(username)}`);
    } catch (err: any) {
       // Personaliza mensajes de error comunes de Cognito si es posible
      if (err.name === 'UsernameExistsException') {
        setError('Este nombre de usuario ya existe.');
      } else if (err.message && err.message.includes('Password not long enough')) {
         setError('La contraseña debe tener al menos 8 caracteres.');
      } else if (err.message && err.message.includes('password did not conform with policy')) {
         setError('La contraseña requiere mayúsculas, minúsculas, números y símbolos.');
      }
      else {
        setError(err.message || 'Error al registrar la cuenta.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor del formulario (Card)
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg border-t-4 border-[#E4C97A]">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Crear Cuenta
        </h2>

        {/* Campo Usuario */}
        <div>
          <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <input
            id="signup-username" // ID único para el label
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="Elige un nombre de usuario"
          />
        </div>

        {/* Campo Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="tu@email.com"
          />
        </div>

         {/* Campo Contraseña */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password" // Importante para gestores
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="Mínimo 8 caracteres"
             // Considera añadir aria-describedby para requisitos de contraseña
          />
           {/* Aquí podrías añadir texto con los requisitos de contraseña */}
           {/* <p className="mt-2 text-xs text-gray-500">Debe incluir mayúsculas, minúsculas, números y símbolos.</p> */}
        </div>

        {/* Mensaje de Error */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Botón Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </div>

         {/* Enlace a Login */}
        <div className="text-sm text-center">
           <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="font-medium text-gray-600 hover:text-gray-900 underline transition duration-150 ease-in-out">
              Inicia Sesión
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};