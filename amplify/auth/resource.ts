// amplify/auth/resource.ts
import { defineAuth, defineFunction } from '@aws-amplify/backend';

const customMessageTrigger = defineFunction({
  entry: './handler.ts',
});

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    customMessage: customMessageTrigger,
  },
});