import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { SignUpInput } from 'aws-amplify/auth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from 'react-hot-toast';
import { StyledInput } from './StyledInput';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'; 

// Esquema de validación con Yup
const signUpSchema = yup.object().shape({
  username: yup.string()
    .email("Ingresa un formato de email válido (ej: tu@dominio.com).")
    .required("El email es obligatorio."),
  password: yup.string()
    .required("La contraseña es obligatoria.")
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .matches(/[a-z]/, "Debe incluir al menos una letra minúscula.")
    .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula.")
    .matches(/[0-9]/, "Debe incluir al menos un número.")
    .matches(/[\^$*.$$$${}()?\-"!@#%&/\\,><':;|_~`+=]/, "Debe incluir al menos un símbolo (ej: @, #, $)."),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], "Las contraseñas no coinciden.")
    .required("Debes confirmar tu contraseña."),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

const SignUpForm: React.FC = () => {
  const { signUpUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError: setFormError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: "onTouched",
  });

  // Valores en tiempo real
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const passwordsMatch = passwordValue === confirmPasswordValue;
  const showValidationIcon = confirmPasswordValue?.length > 0;

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    const signUpInput: SignUpInput = {
      username: data.username,
      password: data.password,
      options: { userAttributes: { email: data.username } }
    };

    try {
      await signUpUser(signUpInput);
      toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
      navigate(`/confirm-signup?username=${encodeURIComponent(data.username)}`);
      reset();
    } catch (err: any) {
      console.error("Error en SignUp:", err);
      if (err.name === 'UsernameExistsException') {
        setFormError('username', { type: 'manual', message: 'Este nombre de usuario ya existe.' });
      } else if (err.message?.includes('Password not long enough') || err.message?.includes('Password must be at least 8 characters')) {
        setFormError('password', { type: 'manual', message: 'La contraseña debe tener al menos 8 caracteres.' });
      } else if (err.message?.includes('password did not conform with policy')) {
        setFormError('password', { type: 'manual', message: 'La contraseña no cumple los requisitos (mayúsculas, minúsculas, números, símbolos).' });
      } else if (err.name === 'InvalidParameterException' && err.message?.toLowerCase().includes('email')) {
        setFormError('username', { type: 'manual', message: 'El formato del email no es válido o el email ya está en uso por otra cuenta.' });
      } else {
        toast.error(err.message || 'Error desconocido al registrar la cuenta.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-[#E4C97A] md:max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <h2 className="text-center text-3xl font-semibold text-gray-800">
          Crear Nueva Cuenta
        </h2>

        <StyledInput
          id="signup-username"
          label="Email"
          registration={register("username")}
          error={errors.username?.message}
          placeholder="tu@dominio.com"
          autoComplete="username"
        />

        <div>
          <StyledInput
            id="signup-password"
            label="Contraseña"
            type="password"
            registration={register("password")}
            error={errors.password?.message}
            placeholder="Crea una contraseña segura"
            autoComplete="new-password"
            aria-describedby="password-requirements"
          />
          {!errors.password && (
            <p id="password-requirements" className="mt-2 text-xs text-gray-500">
              Debe tener 8+ caracteres, incluir mayúsculas, minúsculas, números y símbolos.
            </p>
          )}
        </div>

        {/* Confirmar Contraseña con ícono visual */}
        <div className="relative">
          <StyledInput
            id="signup-confirm-password"
            label="Confirmar Contraseña"
            type="password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />

          {showValidationIcon && (
            <div className="absolute right-3 top-10">
              {passwordsMatch ? (
                <CheckCircleIcon className="text-green-500 w-5 h-5" />
              ) : (
                <XCircleIcon className="text-red-500 w-5 h-5" />
              )}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <a
              href="/login"
              className="font-medium text-[#C0A961] hover:text-[#E4C97A] hover:underline focus:outline-none focus:underline"
            >
              Inicia Sesión Aquí
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
