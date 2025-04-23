import { useState, useEffect, useCallback } from 'react';
import { Hub } from 'aws-amplify/utils';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchUserAttributes,
  
  // Importa los tipos necesarios de Amplify
  type AuthUser as AmplifyAuthUser, // Renombrado para evitar colisión
  type SignUpInput,
  type ConfirmSignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  resendSignUpCode,
} from 'aws-amplify/auth';

// Tipo específico para el usuario que manejaremos en nuestro estado
// Puedes ajustar esto según los atributos que realmente necesites
type AppUser = {
  userId: string;
  username: string;
  attributes?: Record<string, any>;
};

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Interfaz para lo que retorna nuestro hook, ahora más completa
interface UseAuthReturn extends AuthState {
  signInUser: (username: string, password: string) => Promise<void>; // Retorna el usuario de Amplify
  signOutUser: () => Promise<void>;
  signUpUser: (input: SignUpInput) => Promise<void>; // Recibe el objeto de input de Amplify
  confirmSignUpUser: (input: ConfirmSignUpInput) => Promise<void>;
  requestPasswordReset: (username: string) => Promise<void>;
  confirmPasswordReset: (input: ConfirmResetPasswordInput) => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkUser = useCallback(async (): Promise<AppUser | null> => { // Hacemos que retorne el usuario o null
    console.log("Checking user..."); // Log para depuración
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const appUser: AppUser = { userId: cognitoUser.userId, username: cognitoUser.username, attributes };
      setAuthState({
        user: appUser,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log("User found:", appUser);
      return appUser;
    } catch (error) {
      console.log("No user found or error:", error);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  }, []);

  useEffect(() => {
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      console.log("Auth Hub event:", payload.event); // Log para depuración
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          break;
        // Podrías añadir manejo para otros eventos si es necesario
      }
    });

    // Verificar estado inicial
    checkUser();

    return () => {
      hubListenerCancel();
    };
  }, [checkUser]);

  // --- Funciones de Autenticación ---

  const signInUser = useCallback(async (username: string, password: string) => {
    try {
      await signIn({ username, password });
      // El Hub se encargará de actualizar el estado
    } catch (error) {
      console.error("Error signing in:", error);
      throw error; // Re-lanzamos para manejar en el componente
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut();
      // El Hub actualizará el estado
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const signUpUser = useCallback(async (input: SignUpInput) => {
    try {
      // No necesitamos devolver nada explícitamente, pero podrías si Amplify lo hace
      await signUp(input);
      console.log("Sign up successful, verification needed.");
      // Aquí no actualizamos el estado 'isAuthenticated', el usuario debe confirmar
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }, []);

  const confirmSignUpUser = useCallback(async (input: ConfirmSignUpInput) => {
    try {
      await confirmSignUp(input);
      console.log("Sign up confirmed successfully.");
      // Podrías intentar hacer signIn automáticamente aquí o redirigir a login
    } catch (error) {
      console.error("Error confirming sign up:", error);
      throw error;
    }
  }, []);

  const requestPasswordReset = useCallback(async (username: string) => {
    try {
      await resetPassword({ username });
      console.log("Password reset code sent successfully.");
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }, []);

  const confirmPasswordReset = useCallback(async (input: ConfirmResetPasswordInput) => {
    try {
      await confirmResetPassword(input);
      console.log("Password reset successfully.");
      // Aquí podrías redirigir al login
    } catch (error) {
      console.error("Error confirming password reset:", error);
      throw error;
    }
  }, []);

  const resendConfirmationCode = useCallback(async (username: string) => {
    try {
      await resendSignUpCode({ username }); // Llama a la función de Amplify
      console.log("Resend sign up code successful.");
      // No retornamos nada, el componente manejará el mensaje de éxito
    } catch (error) {
      console.error("Error resending sign up code:", error);
      throw error; // Re-lanzar para que el componente lo maneje
    }
  }, []);


  return {
    ...authState,
    signInUser,
    signOutUser,
    signUpUser,
    confirmSignUpUser,
    requestPasswordReset,
    confirmPasswordReset,
    resendConfirmationCode
  };
};