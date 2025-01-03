
import { a, defineAuth, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Product: a.model({
      title: a.string(),
      description: a.string(),
      category: a.string(),
      image: a.string(),
      code: a.string(),
      price: a.string(),
      hola: a.string(),
    })
    .authorization(allow => [allow.publicApiKey()])
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});


/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
