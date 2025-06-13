import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../hooks/useAuth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from 'react-hot-toast';
import { StyledInput } from './StyledInput';  

const loginSchema = yup.object().shape({
  username: yup.string().required("El nombre de usuario o email es obligatorio."),
  password: yup.string().required("La contraseña es obligatoria."),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onTouched", // Validar al perder el foco
  });

  useEffect(() => {
    const signUpConfirmed = searchParams.get('confirmed') === 'true';
    const resetPasswordSuccess = searchParams.get('reset') === 'success';
    const newVerification = searchParams.get('verified') === 'true';

    if (signUpConfirmed) {
      toast.success('¡Cuenta confirmada! Ya puedes iniciar sesión.', { id: 'signup-confirmed-toast' });
      // TODO: Limpiar los query params para que el mensaje no reaparezca
      navigate(location.pathname, { replace: true });
    } else if (resetPasswordSuccess) {
      toast.success('¡Contraseña restablecida! Ya puedes iniciar sesión.', { id: 'reset-success-toast' });
      navigate(location.pathname, { replace: true });
    } else if (newVerification) {
        toast.success('¡Email verificado! Ya puedes iniciar sesión.', { id: 'email-verified-toast' });
        navigate(location.pathname, { replace: true });
    }
  }, [searchParams, navigate, location.pathname]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      await signInUser(data.username, data.password);
      toast.success('¡Inicio de sesión exitoso!'); // Opcional, o solo redirigir
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Error en SignIn:", err);
      if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
        toast.error('Usuario o contraseña incorrectos.');
      } else if (err.name === 'UserNotConfirmedException') {
        toast.error('Usuario no confirmado. Por favor, revisa tu email.');
      } else {
        toast.error(err.message || 'Error al iniciar sesión.');
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-[#E4C97A] md:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <h2 className="text-center text-3xl font-semibold text-gray-800">
            Iniciar Sesión
          </h2>

          <StyledInput
            id="login-username"
            label="Usuario o Email"
            registration={register("username")}
            error={errors.username?.message}
            placeholder="Email"
            autoComplete="username" 
          />

          <StyledInput
            id="login-password"
            label="Contraseña"
            type="password"
            registration={register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            autoComplete="current-password" 
          />

          {/* Botón Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando Sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Enlaces */}
          <div className="text-sm text-center space-y-2">
            <div>
              <Link // Usar Link para navegación interna
                to="/forgot-password" 
                className="font-medium text-gray-600 hover:text-[#C0A961] hover:underline focus:outline-none focus:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* TODO: Implementar registro de usuarios compradores  */}
            {/* <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link // Usar Link para navegación interna
                to="/signup" 
                className="font-medium text-[#C0A961] hover:text-[#E4C97A] hover:underline focus:outline-none focus:underline"
              >
                Regístrate Aquí
              </Link>
            </p> */}
          </div>
        </form>
      </div>
    </>
  );
};