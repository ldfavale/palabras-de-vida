import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
      const signUpConfirmed = searchParams.get('confirmed') === 'true';
      const resetPasswordSuccess = searchParams.get('reset') === 'success';
      if (signUpConfirmed) {
        setMessage('Usuario registrado Correctamente. Puedes Iniciar Sesión')
      }else if(resetPasswordSuccess){
        setMessage('Contraseña reseteada Correctamente. Puedes Iniciar Sesión')
      }
    }, [searchParams]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInUser(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Usuario o contraseña incorrectos.'); // Mensaje más específico
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
          Iniciar Sesión
        </h2>

        {/* Campo Usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario o Email
          </label>
          <input
            id="username"
            name="username" // Buena práctica añadir name
            type="text"
            autoComplete="username" // Ayuda a gestores de contraseñas
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="tu_usuario o tu@email.com"
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password" // Ayuda a gestores de contraseñas
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] focus:border-[#E4C97A] sm:text-sm"
            placeholder="••••••••"
          />
        </div>

        {/* Mensaje de Error */}
        {message && (
          <p className="text-sm text-green-600 text-center">{message}</p>
        )}
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
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </div>

        {/* Enlaces */}
        <div className="text-sm text-center space-y-2">
          <a href="/forgot-password" className="font-medium text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out">
            ¿Olvidaste tu contraseña?
          </a>
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <a href="/signup" className="font-medium text-gray-600 hover:text-gray-900 underline transition duration-150 ease-in-out">
              Regístrate
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};