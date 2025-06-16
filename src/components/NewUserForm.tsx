import React from 'react'; // No necesitamos useState para apiError si usamos toast
import { useAuth } from '../hooks/useAuth';
import type { SignUpInput } from 'aws-amplify/auth';
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from 'react-hot-toast';
import InputField from './InputField';

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
    .required("La confirmación de contraseña es obligatoria.")
    .oneOf([yup.ref('password')], "Las contraseñas no coinciden.")
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

export const NewUserForm: React.FC = () => {
  const { signUpUser } = useAuth();
  // const navigate = useNavigate();

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

  // Observar el valor de la contraseña para mostrar información relevante
  const passwordValue = watch("password");

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    const signUpInput: SignUpInput = {
      username: data.username,
      password: data.password,
      options: { userAttributes: { email: data.username } }
    };

    try {
      await signUpUser(signUpInput);
      toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
      // navigate(`/users/confirm-new-user?username=${encodeURIComponent(data.username)}`);
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
      }
      else {
        toast.error(err.message || 'Error desconocido al registrar la cuenta.');
      }
    }
  };

  return (
    <>
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
         
          
           <InputField 
                type="email" 
                label="Email" 
                placeholder="Tu nombre de usuario único"
                register={register("username")}
                error={errors.username?.message}
              />

          {/* <InputField
            label="Correo Electrónico"
            type="email"
            register={register("email")}
            error={errors.email?.message}
            placeholder="tu@email.com"
          /> */}
          
          <div>
            <InputField
              label="Contraseña"
              type="password"
              register={register("password")}
              error={errors.password?.message}
              placeholder="Crea una contraseña segura"
              aria-describedby="password-requirements"
            />
            {/* Información sobre los requisitos de la contraseña */}
            {!errors.password && ( 
                 <p id="password-requirements" className="mt-2 text-xs text-gray-500">
                    Debe tener 8+ caracteres, incluir mayúsculas, minúsculas, números y símbolos.
                 </p>
            )}
          </div>

          {/* Campo de confirmación de contraseña */}
          <div>
            <InputField
              label="Confirmar Contraseña"
              type="password"
              register={register("confirmPassword")}
              error={errors.confirmPassword?.message}
              placeholder="Confirma tu contraseña"
              aria-describedby="confirm-password-help"
            />
            {/* Mostrar ayuda visual cuando hay una contraseña ingresada pero no hay error */}
            {passwordValue && !errors.confirmPassword && ( 
                 <p id="confirm-password-help" className="mt-2 text-xs text-gray-500">
                    Ingresa la misma contraseña para confirmar.
                 </p>
            )}
          </div>
          

          {/* Botón Submit */}
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
                'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      
    </>
  );
};