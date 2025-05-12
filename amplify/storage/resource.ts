import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'appMedia',
  isDefault: true,
  access: (allow) => ({
    'product-images/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read', 'write'])
    ],
  })
});



export const storageOpensearch = defineStorage({
  name: "opensearch-backup-bucket-amplify-gen-2",
  access: allow => ({
    'public/*': [
      allow.guest.to(['list', 'write', 'get'])
    ]
  })
})