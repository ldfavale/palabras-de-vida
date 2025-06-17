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
  confirmSignIn, // Agregamos confirmSignIn para el challenge
  
  type AuthUser as AmplifyAuthUser,
  type SignUpInput,
  type ConfirmSignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  resendSignUpCode,
} from 'aws-amplify/auth';

type AppUser = {
  userId: string;
  username: string;
  attributes?: Record<string, any>;
};

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authChallenge: AuthChallenge | null;
  challengeUsername: string | null;
}

// Tipos para manejar diferentes estados de autenticación
type AuthChallenge = 'NEW_PASSWORD_REQUIRED' | 'MFA_REQUIRED' | 'SOFTWARE_TOKEN_MFA';

interface SignInResult {
  success: boolean;
  challenge?: AuthChallenge;
  username?: string;
}

interface UseAuthReturn extends AuthState {
  signInUser: (username: string, password: string) => Promise<SignInResult>;
  signOutUser: () => Promise<void>;
  signUpUser: (input: SignUpInput) => Promise<void>;
  confirmSignUpUser: (input: ConfirmSignUpInput) => Promise<void>;
  requestPasswordReset: (username: string) => Promise<void>;
  confirmPasswordReset: (input: ConfirmResetPasswordInput) => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<void>;
  completeNewPasswordChallenge: (newPassword: string) => Promise<SignInResult>;
  // Estados adicionales para mejor UX
  authChallenge: AuthChallenge | null;
  challengeUsername: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    authChallenge: null,
    challengeUsername: null,
  });

  const checkUser = useCallback(async (): Promise<AppUser | null> => {
    console.log("Checking user...");
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const appUser: AppUser = { 
        userId: cognitoUser.userId, 
        username: cognitoUser.username, 
        attributes 
      };
      setAuthState({
        user: appUser,
        isAuthenticated: true,
        isLoading: false,
        authChallenge: null,
        challengeUsername: null,
      });
      console.log("User found:", appUser);
      return appUser;
    } catch (error) {
      console.log("No user found or error:", error);
      setAuthState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        authChallenge: null, 
        challengeUsername: null 
      });
      return null;
    }
  }, []);

  useEffect(() => {
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      console.log("Auth Hub event:", payload.event);
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setAuthState({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            authChallenge: null, 
            challengeUsername: null 
          });
          break;
      }
    });

    checkUser();

    return () => {
      hubListenerCancel();
    };
  }, [checkUser]);

  // Función de signIn mejorada con mejor manejo de challenges
  const signInUser = useCallback(async (username: string, password: string): Promise<SignInResult> => {
    try {
      const result = await signIn({ username, password });
      
      // Verificar si hay un challenge pendiente
      if (result.nextStep) {
        const { signInStep } = result.nextStep;
        
        if (signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          // Actualizar estado del challenge
          setAuthState(prev => ({
            ...prev,
            authChallenge: 'NEW_PASSWORD_REQUIRED',
            challengeUsername: username,
          }));
          
          return {
            success: false,
            challenge: 'NEW_PASSWORD_REQUIRED',
            username
          };
          
        }
        
        if (signInStep === 'DONE') {
          return {
            success: true,
            username
          };
        }

        console.log("Unhandled challenge:", signInStep);
        throw new Error(`Challenge no soportado: ${signInStep}`);
      }
      
      
      return { success: true };
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }, []);

  // Función mejorada para completar el challenge
  const completeNewPasswordChallenge = useCallback(async (newPassword: string): Promise<SignInResult> => {
    try {
      const result = await confirmSignIn({
        challengeResponse: newPassword
      });
      
      // Limpiar el estado del challenge
      setAuthState(prev => ({
        ...prev,
        authChallenge: null,
        challengeUsername: null,
      }));
      
      console.log("Password challenge completed successfully");
      return { success: true };
      
    } catch (error) {
      console.error("Error completing new password challenge:", error);
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const signUpUser = useCallback(async (input: SignUpInput) => {
    try {
      await signUp(input);
      console.log("Sign up successful, verification needed.");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }, []);

  const confirmSignUpUser = useCallback(async (input: ConfirmSignUpInput) => {
    try {
      await confirmSignUp(input);
      console.log("Sign up confirmed successfully.");
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
    } catch (error) {
      console.error("Error confirming password reset:", error);
      throw error;
    }
  }, []);

  const resendConfirmationCode = useCallback(async (username: string) => {
    try {
      await resendSignUpCode({ username });
      console.log("Resend sign up code successful.");
    } catch (error) {
      console.error("Error resending sign up code:", error);
      throw error;
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
    resendConfirmationCode,
    completeNewPasswordChallenge,
    // Exposer estados de challenge para mejor UX
    authChallenge: authState.authChallenge,
    challengeUsername: authState.challengeUsername,
  };
};