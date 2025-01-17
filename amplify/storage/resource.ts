import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'appMedia',
  access: (allow) => ({
    'product-images/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read', 'write'])
    ],
  })
});
