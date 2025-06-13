// src/components/ConfirmNewUserForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from 'react-hot-toast';
import InputField from './InputField';

// Esquema de validación con Yup
const confirmSignUpSchema = yup.object().shape({
  username: yup.string().required("El nombre de usuario es obligatorio."),
  confirmationCode: yup.string()
    .required("El código de confirmación es obligatorio.")
    .matches(/^[0-9]+$/, "El código solo debe contener números.") // Asumiendo que Cognito usa solo números
    .length(6, "El código debe tener 6 dígitos."), // Asumiendo longitud fija de Cognito
});

type ConfirmSignUpFormData = yup.InferType<typeof confirmSignUpSchema>;

export const ConfirmNewUserForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmSignUpUser, resendConfirmationCode } = useAuth();
  const initialUsername = searchParams.get('username') || '';

  const {
    register,
    handleSubmit,
    setValue,
    getValues, // Para obtener el username para reenviar
    formState: { errors, isSubmitting: isConfirming }, // isSubmitting es para la acción principal del form
  } = useForm<ConfirmSignUpFormData>({
    resolver: yupResolver(confirmSignUpSchema),
    defaultValues: {
      username: initialUsername,
      confirmationCode: ''
    },
    mode: "onTouched",
  });

  // Estado específico para la acción de reenviar código
  const [isResendingCode, setIsResendingCode] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      // El defaultValues ya debería haberlo seteado, pero podemos re-asegurar.
      setValue('username', initialUsername, { shouldValidate: false }); // No validar al setear inicialmente
    } else {
      toast.error("Nombre de usuario no encontrado. Por favor, verifica el enlace o regístrate de nuevo.", { id: 'no-username-toast', duration: 6000 });
      // Considerar redirigir a signup o login si no hay username
      // navigate('/signup'); 
    }
  }, [initialUsername, setValue]);

  // Handler para confirmar la cuenta
  const onSubmitConfirm: SubmitHandler<ConfirmSignUpFormData> = async (data) => {
    try {
      await confirmSignUpUser({ username: data.username, confirmationCode: data.confirmationCode });
      toast.success('¡Cuenta confirmada exitosamente!');
      // navigate('/login?confirmed=true', { replace: true });
    } catch (err: any) {
      console.error("Error al confirmar:", err);
      if (err.name === 'CodeMismatchException') {
        toast.error('El código de confirmación es incorrecto.');
      } else if (err.name === 'ExpiredCodeException') {
        toast.error('El código ha expirado. Por favor, solicita uno nuevo.');
      } else if (err.name === 'UserNotFoundException'){
        toast.error('Usuario no encontrado. Verifica el nombre de usuario o regístrate.');
      } else {
        toast.error(err.message || 'Error al confirmar la cuenta.');
      }
    }
  };

  // Handler para reenviar el código
  const handleResendCode = async () => {
    const currentUsername = getValues('username'); // Obtener el username del formulario
    if (!currentUsername) {
      toast.error("Por favor, ingresa tu nombre de usuario para reenviar el código.");
      return;
    }

    setIsResendingCode(true);
    try {
      await resendConfirmationCode(currentUsername);
      toast.success(`Se ha enviado un nuevo código de confirmación al email asociado con '${currentUsername}'.`);
    } catch (err: any) {
      console.error("Error al reenviar código:", err);
      if (err.name === 'LimitExceededException') {
        toast.error('Has excedido el límite de reenvíos. Intenta más tarde.');
      } else if (err.name === 'UserNotFoundException') {
         toast.error('Usuario no encontrado. Verifica el nombre de usuario.');
      }
      else {
        toast.error(err.message || "Error al reenviar el código.");
      }
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <>
        <form onSubmit={handleSubmit(onSubmitConfirm)} className="space-y-6">
          <p className="text-center text-sm text-gray-600">
            Hemos enviado un código de confirmación a tu correo electrónico.
            Ingresa el código y tu nombre de usuario para activar tu cuenta.
          </p>

          <InputField
            // id="confirm-username"
            label="Nombre de Usuario"
            register={register("username")}
            error={errors.username?.message}
            placeholder="Tu nombre de usuario"
            // readOnly={!!initialUsername} // Hacerlo readOnly si viene de la URL
            // autoComplete="username"
          />

          <InputField
            // id="confirmationCode"
            label="Código de Confirmación"
            type="text" // Podría ser 'tel' para inputMode numérico en móviles
            // inputMode="numeric" // Sugiere teclado numérico
            register={register("confirmationCode")}
            error={errors.confirmationCode?.message}
            placeholder="123456"
            // autoComplete="one-time-code"
          />
          
          {/* Botón Confirmar Cuenta */}
          <div>
            <button
              type="submit"
              disabled={isConfirming || isResendingCode || !initialUsername} 
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#E4C97A] hover:bg-[#d1b86a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E4C97A] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group"
            >
              {isConfirming ? (
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

          {/* Botón y Enlace para Reenviar Código */}
          <div className="text-sm text-center pt-2">
            <p className="text-gray-600 mb-2">¿No recibiste el código o ha expirado?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isConfirming || isResendingCode || !getValues('username')} // Deshabilitar si no hay username en el campo
              className="font-medium text-[#C0A961] hover:text-[#E4C97A] hover:underline focus:outline-none focus:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isResendingCode ? (
                 <>
                  <svg className="inline animate-spin mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando código...
                </>
              ) : (
                'Reenviar código de confirmación'
              )}
            </button>
          </div>

           {/* Enlace a Login/Signup */}
           <div className="text-sm text-center border-t pt-6 mt-6">
            
             <p className="text-gray-600 mt-1">
              Volver a {' '}
              <Link 
                to="/users/new" 
                className="font-medium text-[#C0A961] hover:text-[#E4C97A] hover:underline focus:outline-none focus:underline"
              >
                Crear nuevo usuario
              </Link>
            </p>
          </div>

        </form>
    </>
  );
};