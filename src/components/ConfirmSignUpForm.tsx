// src/components/ConfirmSignUpForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from 'react-hot-toast';
import InputField from './InputField';

const confirmSignUpSchema = yup.object().shape({
  username: yup.string()
    .email("Ingresa un formato de email válido.")
    .required("El email es obligatorio."),
  confirmationCode: yup.string()
    .required("El código de confirmación es obligatorio.")
    .matches(/^\d{6}$/, "El código debe tener exactamente 6 dígitos."),
});

type ConfirmSignUpFormData = yup.InferType<typeof confirmSignUpSchema>;

export const ConfirmSignUpForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmSignUpUser, resendConfirmationCode } = useAuth();
  const initialUsername = searchParams.get('username') || '';

  // Estado para la acción de reenviar código
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError: setFormError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmSignUpFormData>({
    resolver: yupResolver(confirmSignUpSchema),
    mode: "onTouched",
    defaultValues: {
      username: initialUsername,
    }
  });

  const usernameValue = watch("username");

  useEffect(() => {
    if (!initialUsername) {
      console.warn("Username no encontrado en URL");
      toast.error('No se encontró información del usuario. Por favor, intenta registrarte nuevamente.');
    }
  }, [initialUsername]);

  // Handler para la confirmación
  const onSubmit: SubmitHandler<ConfirmSignUpFormData> = async (data) => {
    // Limpiar mensajes de reenvío
    setResendMessage(null);

    try {
      await confirmSignUpUser({ 
        username: data.username, 
        confirmationCode: data.confirmationCode 
      });
      
      toast.success('¡Cuenta confirmada exitosamente!');
      navigate('/login?confirmed=true');
    } catch (err: any) {
      console.error("Error confirmando cuenta:", err);
      
      if (err.name === 'CodeMismatchException') {
        setFormError('confirmationCode', { 
          type: 'manual', 
          message: 'El código de confirmación es incorrecto.' 
        });
      } else if (err.name === 'ExpiredCodeException') {
        setFormError('confirmationCode', { 
          type: 'manual', 
          message: 'El código ha expirado. Solicita uno nuevo.' 
        });
      } else if (err.name === 'LimitExceededException') {
        toast.error('Demasiados intentos. Espera un momento antes de intentar nuevamente.');
      } else if (err.name === 'UserNotFoundException') {
        setFormError('username', { 
          type: 'manual', 
          message: 'No se encontró el usuario. Verifica tu email.' 
        });
      } else {
        toast.error(err.message || 'Error al confirmar el código.');
      }
    }
  };

  // Manejador para reenviar código
  const handleResendCode = async () => {
    if (!usernameValue) {
      toast.error("Ingresa tu email para reenviar el código.");
      return;
    }

    setResendMessage(null);
    setResendLoading(true);

    try {
      await resendConfirmationCode(usernameValue);
      setResendMessage(`Nuevo código enviado a ${usernameValue}.`);
      toast.success('Código reenviado exitosamente.');
    } catch (err: any) {
      console.error("Error reenviando código:", err);
      
      if (err.name === 'LimitExceededException') {
        toast.error('Límite de reenvíos alcanzado. Espera un momento antes de intentar nuevamente.');
      } else if (err.name === 'UserNotFoundException') {
        setFormError('username', { 
          type: 'manual', 
          message: 'No se encontró el usuario con este email.' 
        });
      } else {
        toast.error(err.message || "Error al reenviar el código.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-[#E4C97A] md:max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800">
            Confirmar Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa el código de 6 dígitos enviado a tu email.
          </p>
        </div>

        {/* Campo Email/Username */}
        <InputField 
          type="email" 
          label="Email" 
          placeholder="tu@email.com"
          register={register("username")}
          error={errors.username?.message}
          readOnly={!!initialUsername}
          className={initialUsername ? 'bg-gray-50' : ''}
        />

        {/* Campo Código de Confirmación */}
        <InputField
          label="Código de Confirmación"
          type="text"
          placeholder="123456"
          register={register("confirmationCode")}
          error={errors.confirmationCode?.message}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
        />

        {/* Mensaje de éxito de reenvío */}
        {resendMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{resendMessage}</p>
          </div>
        )}

        {/* Botón Confirmar */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || resendLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirmando...
              </>
            ) : (
              'Confirmar Cuenta'
            )}
          </button>
        </div>

        {/* Botón para reenviar código */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isSubmitting || resendLoading || !usernameValue}
            className="text-sm font-medium text-gray-600 hover:text-[#C0A961] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {resendLoading ? 'Enviando código...' : '¿No recibiste el código? Reenviar'}
          </button>

          {/* Link para volver al registro */}
          <div className="pt-2 border-t border-gray-100">
            <Link
              to="/register"
              className="text-sm font-medium text-gray-600 hover:text-[#C0A961] hover:underline focus:outline-none focus:underline"
            >
              ← Volver al registro
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};