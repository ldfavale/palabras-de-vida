import { type ClientSchema, a, defineData } from '@aws-amplify/backend';



const schema = a.schema({
  Product: a
    .model({
      title: a.string().required(), 
      description: a.string(),
      images: a.string().array(), // Puedes mantenerlo si son rutas relativas o IDs O usar a.url() si son URLs completas
      code: a.string(),
      price: a.float(),
      categoryIds: a.string().array(),
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

        
   // --- ¡NUEVO! Define un tipo para los fragmentos de resaltado ---
  HighlightDetail: a.customType({
    title: a.string().array(), // Array de strings HTML resaltados
    description: a.string().array(),
    code: a.string().array(), // Si también resaltas el código
    // Añade otros campos que podrías resaltar
  }),

  // --- ¡NUEVO! Define un tipo para los ítems de resultado de búsqueda ---
  ProductSearchResultItem: a.customType({
    // Incluye los campos del modelo Product que quieres que se devuelvan en la búsqueda
    id: a.id().required(),
    title: a.string().required(), // Asegúrate que los campos requeridos aquí coincidan con lo que devuelve el resolver
    description: a.string(),
    images: a.string().array(),
    code: a.string(),
    price: a.float(),
    categoryIds: a.string().array(), // Si los devuelves desde el resolver (_source)
    createdAt: a.datetime(), // Asumiendo que estos campos existen en _source
    updatedAt: a.datetime(),
    highlight: a.ref('HighlightDetail')
   }),

  searchProducts: a
    .query()
    .arguments({
      searchTerm: a.string(),
      categoryIDs: a.string().array(), 
      from: a.integer(),    
      size: a.integer()
    })
    .returns(a.ref("ProductSearchResultItem").array())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./searchProductsResolver.js",        dataSource: "osDataSource",
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

