import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast, { Toaster } from 'react-hot-toast';
import { StyledInput } from './StyledInput';

const loginSchema = yup.object().shape({
  username: yup.string().required("El nombre de usuario o email es obligatorio."),
  password: yup.string().required("La contraseña es obligatoria."),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { signInUser, authChallenge, challengeUsername } = useAuth();
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
    mode: "onTouched",
  });

  useEffect(() => {
    const signUpConfirmed = searchParams.get('confirmed') === 'true';
    const resetPasswordSuccess = searchParams.get('reset') === 'success';
    const newVerification = searchParams.get('verified') === 'true';

    if (signUpConfirmed) {
      toast.success('¡Cuenta confirmada! Ya puedes iniciar sesión.', { id: 'signup-confirmed-toast' });
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
      const result = await signInUser(data.username, data.password);
      
      if (result.success) {
        toast.success('¡Inicio de sesión exitoso!');
        navigate(from, { replace: true });
      }
      // Si hay un challenge, el componente se re-renderizará automáticamente
      // debido al cambio en authChallenge del hook
      
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

  // Si hay un challenge activo, mostrar el formulario correspondiente
  if (authChallenge === 'NEW_PASSWORD_REQUIRED' && challengeUsername) {
    return (
      <ForcePasswordChangeForm 
        username={challengeUsername}
        onSuccess={() => {
          toast.success('¡Contraseña cambiada exitosamente!');
          navigate(from, { replace: true });
        }}
      />
    );
  }

  return (
    <>
    <Toaster
            position="top-right" 
            reverseOrder={false}
            toastOptions={{ 
              duration: 5000, 
              // style: { background: '#363636', color: '#fff' },
              success: {
                duration: 3000,
                // theme: { primary: 'green', secondary: 'black', },
              },
              error: {
                duration: 5000,
              }
            }}
          />
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

          <div className="text-sm text-center space-y-2">
            <div>
              <Link
                to="/forgot-password" 
                className="font-medium text-gray-600 hover:text-[#C0A961] hover:underline focus:outline-none focus:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

// Componente para forzar cambio de contraseña
interface ForcePasswordChangeFormProps {
  username: string;
  onSuccess: () => void;
}

const passwordChangeSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[a-z]/, "Debe contener al menos una minúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
    .required("La nueva contraseña es obligatoria"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], "Las contraseñas no coinciden")
    .required("Confirma tu nueva contraseña"),
});

type PasswordChangeFormData = yup.InferType<typeof passwordChangeSchema>;

const ForcePasswordChangeForm: React.FC<ForcePasswordChangeFormProps> = ({
  username,
  onSuccess
}) => {
  const { completeNewPasswordChallenge } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(passwordChangeSchema),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<PasswordChangeFormData> = async (data) => {
    try {
      const result = await completeNewPasswordChallenge(data.newPassword);
      if (result.success) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error cambiando contraseña:", err);
      toast.error(err.message || 'Error al cambiar la contraseña.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-orange-500 md:max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800">
            Cambio de Contraseña Requerido
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Para <strong>{username}</strong>, debes establecer una nueva contraseña para continuar.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Requisitos de la contraseña:
          </h3>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Mínimo 8 caracteres</li>
            <li>• Al menos una mayúscula</li>
            <li>• Al menos una minúscula</li>
            <li>• Al menos un número</li>
            <li>• Al menos un carácter especial</li>
          </ul>
        </div>

        <StyledInput
          id="new-password"
          label="Nueva Contraseña"
          type="password"
          registration={register("newPassword")}
          error={errors.newPassword?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <StyledInput
          id="confirm-password"
          label="Confirmar Nueva Contraseña"
          type="password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
              </>
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};