import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // No se usa aquí directamente
import { useAuth } from '../hooks/useAuth';

export const ForgotPasswordForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { requestPasswordReset } = useAuth();
  // const navigate = useNavigate(); // No necesario si no rediriges automáticamente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await requestPasswordReset(username);
      setMessage(`Si existe una cuenta para ${username}, recibirás un email con un código para restablecer tu contraseña.`);
    } catch (err: any) {
       // Cognito a menudo no distingue si el usuario no existe por seguridad
       // Por eso el mensaje genérico en 'setMessage' es a menudo mejor UX
       setError(err.message || 'Ocurrió un error al solicitar el reseteo.');
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
          Restablecer Contraseña
        </h2>

         <p className="text-center text-sm text-gray-600">
          Ingresa tu nombre de usuario o email y te enviaremos un código para crear una nueva contraseña.
        </p>

        {/* Campo Usuario/Email */}
        <div>
          <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario o Email
          </label>
          <input
            id="reset-username"
            name="username"
            type="text" // O 'email' si solo permites email
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="tu_usuario o tu@email.com"
          />
        </div>


        {/* Mensaje de Error */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
         {/* Mensaje de Éxito */}
        {message && (
          <p className="text-sm text-green-600 text-center">{message}</p>
        )}

        {/* Botón Submit */}
        <div>
          <button
            type="submit"
            disabled={loading || !!message} // Deshabilitar si se está enviando o ya se envió
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {loading ? 'Enviando...' : 'Enviar Código de Reseteo'}
          </button>
        </div>

         {/* Enlaces */}
        <div className="text-sm text-center space-y-2">
             {/* Enlace para ir a ingresar el código (aparece si hay mensaje de éxito) */}
             {message && (
                 <a href={`/reset-password?username=${encodeURIComponent(username)}`} className="font-medium text-gray-600 hover:text-gray-900 underline transition duration-150 ease-in-out">
                    Ya tengo el código
                 </a>
            )}
             <p className="text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <a href="/login" className="font-medium text-gray-600 hover:text-gray-900 underline transition duration-150 ease-in-out">
                Volver a Iniciar Sesión
                </a>
            </p>
        </div>
      </form>
    </div>
  );
};