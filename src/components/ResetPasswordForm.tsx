import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ConfirmResetPasswordInput } from 'aws-amplify/auth';

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmPasswordReset } = useAuth();
  const initialUsername = searchParams.get('username') || '';

  const [username, setUsername] = useState(initialUsername);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialUsername) {
      console.warn("Username no encontrado en URL para resetear");
      // Considera mostrar un mensaje o redirigir
    }
  }, [initialUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !confirmationCode || !newPassword) {
        setError("Todos los campos son requeridos.");
        setLoading(false);
        return;
    }

    const input: ConfirmResetPasswordInput = {
      username,
      confirmationCode,
      newPassword,
    };

    try {
      await confirmPasswordReset(input);
      navigate('/login?reset=success'); // Ir a login con mensaje opcional
    } catch (err: any) {
       if (err.name === 'CodeMismatchException') {
          setError('El código de confirmación es incorrecto.');
      } else if (err.name === 'ExpiredCodeException') {
           setError('El código de confirmación ha expirado. Solicita uno nuevo desde "Olvidé mi contraseña".');
      } else if (err.message && err.message.includes('Password not long enough')) {
         setError('La nueva contraseña debe tener al menos 8 caracteres.');
      } else if (err.message && err.message.includes('password did not conform with policy')) {
         setError('La nueva contraseña requiere mayúsculas, minúsculas, números y símbolos.');
      }
       else {
           setError(err.message || 'Error al restablecer la contraseña.');
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
          Crear Nueva Contraseña
        </h2>

        <p className="text-center text-sm text-gray-600">
          Ingresa el código recibido y tu nueva contraseña.
        </p>

        {/* Campo Usuario (solo lectura si viene de URL) */}
        <div>
          <label htmlFor="reset-pass-username" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <input
            id="reset-pass-username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={!!initialUsername}
            required
            className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm ${initialUsername ? 'bg-gray-100' : ''}`}
          />
        </div>

        {/* Campo Código */}
        <div>
          <label htmlFor="reset-confirmationCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código de Confirmación
          </label>
          <input
            id="reset-confirmationCode"
            name="confirmationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="123456"
          />
        </div>

        {/* Campo Nueva Contraseña */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="Elige una contraseña segura"
          />
           {/* Aquí podrías añadir texto con los requisitos de contraseña */}
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
            {loading ? 'Restableciendo...' : 'Establecer Nueva Contraseña'}
          </button>
        </div>

         {/* Enlace a Login */}
        <div className="text-sm text-center">
           <p className="text-gray-600">
            <a href="/login" className="font-medium text-gray-600 hover:text-gray-900 underline transition duration-150 ease-in-out">
              Volver a Iniciar Sesión
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};