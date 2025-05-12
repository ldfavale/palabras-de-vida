import { type ClientSchema, a, defineData } from '@aws-amplify/backend';



const schema = a.schema({
  Product: a
    .model({
      title: a.string().required(), 
      description: a.string(),
      images: a.string().array(), // Puedes mantenerlo si son rutas relativas o IDs O usar a.url() si son URLs completas
      code: a.string(),
      price: a.float(),
      // categoryIds: a.string().array(),
      categories: a.hasMany('ProductCategory', 'productId'),
    })
    .authorization(allow => [allow.publicApiKey()]),

  Category: a
    .model({
      name: a.string().required(),
      label: a.string().required(),
      products: a.hasMany('ProductCategory', 'categoryId'),
    })
    .authorization(allow => [allow.publicApiKey()]),

    ProductCategory: a
    .model({
      productId: a.id().required(),
      categoryId: a.id().required(), 
      product: a.belongsTo('Product', 'productId'),
      category: a.belongsTo('Category', 'categoryId'),
    })
    .authorization(allow => [allow.publicApiKey()]),

        
    searchProducts: a
    .query()
    .returns(a.ref("Product").array())
    .arguments({
      searchTerm: a.string(), 
      // categoryIDs: a.string().array() // 
    })
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./searchProductsResolver.js", // Asegúrate de que el nombre sea correcto
        dataSource: "osDataSource",
      })
    ),
});


export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});

export type Schema = ClientSchema<typeof schema>;

