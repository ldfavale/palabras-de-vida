// amplify/auth/handler.ts
// @ts-ignore: Este módulo lo proporciona el entorno de Amplify en la nube.
import type { CustomMessageTriggerHandler } from 'aws-amplify-backend-fn-runner';

export const handler: CustomMessageTriggerHandler = async (event: CustomMessageTriggerHandler) => {
  if (event.triggerSource === 'CustomMessage_SignUp') {
    const { codeParameter } = event.request;
    const { email } = event.request.userAttributes;
    
    const environment = process.env.AWS_BRANCH || 'main';
    const baseUrl = getBaseUrlForEnvironment(environment);
    
    const confirmationUrl = `${baseUrl}/users/confirm-new-user?username=${email}`;
    
    event.response.emailSubject = `Confirma tu cuenta en Casa Palabras de Vida`;
    event.response.emailMessage = `
      <p>Hola,</p>
      <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para confirmar tu cuenta:</p>
      <a href="${confirmationUrl}">Confirmar mi cuenta</a>
      <p>Código de confirmación: ${codeParameter}</p>
    `;
  }
  
  return event;
};

function getBaseUrlForEnvironment(environment: string): string {
  const urlMap: Record<string, string> = {
    'main': 'https://casapalabrasdevida.com',
    'dev': 'https://dev.casapalabrasdevida.com',
    'staging': 'https://staging.casapalabrasdevida.com',
    'local': 'http://localhost:5173'
  };
  
  return urlMap[environment] || urlMap['main']; // Fallback a producción
}