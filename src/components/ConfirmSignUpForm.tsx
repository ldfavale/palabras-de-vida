// src/components/ConfirmSignUpForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ConfirmSignUpForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 1. Obtener la nueva función del hook
  const { confirmSignUpUser, resendConfirmationCode } = useAuth();
  const initialUsername = searchParams.get('username') || '';

  const [username, setUsername] = useState(initialUsername);
  const [confirmationCode, setConfirmationCode] = useState('');

  // Estado para la acción principal de confirmar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 2. NUEVO ESTADO: Para la acción de reenviar código ---
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  // --------------------------------------------------------

  useEffect(() => {
    if (!initialUsername) {
      console.warn("Username no encontrado en URL");
      // Podrías mostrar un mensaje o redirigir
    }
  }, [initialUsername]);

  // --- Handler para la acción principal de confirmar ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Limpiar mensajes/errores de *reenvío* al intentar confirmar
    setResendMessage(null);
    setResendError(null);
    // Limpiar errores de *confirmación* previos
    setError(null);
    setLoading(true); // Activar loading principal

    if (!username || !confirmationCode) {
      setError("Usuario y código son requeridos.");
      setLoading(false);
      return;
    }

    try {
      await confirmSignUpUser({ username, confirmationCode });
      navigate('/login?confirmed=true');
    } catch (err: any) {
      // ... (Manejo de errores para confirmSignUpUser como antes) ...
      if (err.name === 'CodeMismatchException') {
        setError('El código de confirmación es incorrecto.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('El código ha expirado. Solicita uno nuevo.');
      } else {
        setError(err.message || 'Error al confirmar el código.');
      }
      console.error(err);
    } finally {
      setLoading(false); // Desactivar loading principal
    }
  };

  // --- 3. NUEVA FUNCIÓN: Manejador para reenviar código ---
  const handleResendCode = async () => {
    if (!username) {
      // Mostrar error específico de reenvío
      setResendError("Ingresa tu nombre de usuario para reenviar el código.");
      return;
    }
    // Limpiar mensajes/errores de *confirmación* al intentar reenviar
    setError(null);
    // Limpiar mensajes/errores previos de *reenvío*
    setResendMessage(null);
    setResendError(null);
    setResendLoading(true); // Activar loading de reenvío

    try {
      await resendConfirmationCode(username); // Llamar a la función del hook
      // Mostrar mensaje de éxito específico de reenvío
      setResendMessage(`Nuevo código enviado a la dirección asociada con ${username}.`);
    } catch (err: any) {
      // Mostrar error específico de reenvío
      setResendError(err.message || "Error al reenviar el código.");
      console.error("Error resending code:", err);
    } finally {
      setResendLoading(false); // Desactivar loading de reenvío
    }
  };
  // --------------------------------------------------------

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg border-t-4 border-[#E4C97A]">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Confirmar Cuenta
        </h2>

        <p className="text-center text-sm text-gray-600">
          Ingresa el código de confirmación enviado a tu email.
        </p>

        {/* Campo Usuario (sin cambios funcionales) */}
        <div>
          <label htmlFor="confirm-username" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <input
            id="confirm-username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={!!initialUsername}
            required
            className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm ${initialUsername ? 'bg-gray-100' : ''}`}
          />
        </div>

        {/* Campo Código (sin cambios funcionales) */}
        <div>
          <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código de Confirmación
          </label>
          <input
            id="confirmationCode"
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

        {/* --- 5. Mostrar Errores/Mensajes --- */}
        {/* Error de Confirmación (acción principal) */}
        {error && (
          <p className="text-sm text-red-600 text-center -mt-2 mb-2">{error}</p>
        )}
        {/* Error de Reenvío */}
        {resendError && (
          <p className="text-sm text-red-600 text-center -mt-2 mb-2">{resendError}</p>
        )}
        {/* Mensaje de Éxito de Reenvío */}
        {resendMessage && !resendError && ( // Mostrar solo si no hay error de reenvío
          <p className="text-sm text-green-600 text-center -mt-2 mb-2">{resendMessage}</p>
        )}
        {/* ----------------------------------------- */}

        {/* Botón Confirmar (acción principal) */}
        <div>
          <button
            type="submit"
            // Deshabilitar si alguna acción está cargando
            disabled={loading || resendLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {/* Mostrar estado de carga principal si está activo */}
            {loading ? 'Confirmando...' : 'Confirmar Cuenta'}
          </button>
        </div>

        {/* --- 4. Botón para Reenviar Código --- */}
        <div className="text-sm text-center">
          <button
            type="button" // Importante: no submit
            onClick={handleResendCode}
            // Deshabilitar si alguna acción está cargando o no hay username
            disabled={loading || resendLoading || !username}
            className="font-medium text-gray-600 hover:text-gray-900 underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {/* Mostrar estado de carga de reenvío si está activo */}
            {resendLoading ? 'Enviando código...' : '¿No recibiste el código? Reenviar'}
          </button>
        </div>
        {/* ----------------------------------------- */}
      </form>
    </div>
  );
};