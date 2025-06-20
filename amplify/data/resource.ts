import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const useOpenSearch = process.env.USE_OPENSEARCH === 'true';

interface Queries {
  searchProducts?: any; 
}

const queries: Queries = {};

if (useOpenSearch) {
  queries.searchProducts = a
    .query()
    .arguments({  
      searchTerm: a.string(),
      categoryIds: a.string().array(), 
      sortBy: a.string(),
      from: a.integer(),    
      size: a.integer()
     })
    .returns(a.ref("PaginatedProductSearchResults"))
    .handler(a.handler.custom({
        entry: "./searchProductsResolver.js", // El de OpenSearch
        dataSource: "osDataSource",
    }));
} else {
  queries.searchProducts = a
    .query()
    .arguments({  
      searchTerm: a.string(),
      categoryIds: a.string().array(), 
      sortBy: a.string(),
      nextToken: a.string(), // Para paginación
     }) 
    .returns(a.ref("PaginatedProductSearchResults"))
    .handler(a.handler.custom({
        entry: "./searchProductsDynamoResolver.js",
    }));
}


const schema = a.schema({
  Product: a
    .model({
      title: a.string().required(),
      normalizedTitle: a.string(), 
      description: a.string(),
      images: a.string().array(), // Puedes mantenerlo si son rutas relativas o IDs O usar a.url() si son URLs completas
      code: a.string(),
      price: a.float(),
      categoryIds: a.string().array(),
      categories: a.hasMany('ProductCategory', 'productId'),
      searchableStatus: a.string(),
    })
    .authorization(allow => [allow.publicApiKey()])
    .secondaryIndexes(index => [
      index('searchableStatus')
        .sortKeys(['normalizedTitle'])
        .queryField('searchProductsByTitle')
    ]),

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
    .authorization(allow => [allow.publicApiKey()])
    .secondaryIndexes(index => [ 
      index('productId').queryField('productCategoriesByProductId') 
    ]),

        
   // --- Tipo para los fragmentos de resaltado ---
  HighlightDetail: a.customType({
    title: a.string().array(), // Array de strings HTML resaltados
    description: a.string().array(),
    code: a.string().array(), 
  }),

  // --- Tipo para los ítems de resultado de búsqueda ---
  ProductSearchResultItem: a.customType({
    // Campos del modelo Product que queremos que se devuelvan en la búsqueda
    id: a.id().required(),
    title: a.string().required(), 
    description: a.string(),
    images: a.string().array(),
    code: a.string(),
    price: a.float(),
    categoryIds: a.string().array(), 
    createdAt: a.datetime(), 
    updatedAt: a.datetime(),
    highlight: a.ref('HighlightDetail')
   }),

   PaginatedProductSearchResults: a.customType({
    items: a.ref("ProductSearchResultItem").array().required(), 
    totalCount: a.integer().required()                       
  }),

  // searchProducts: a
  //   .query()
  //   .arguments({
  //     searchTerm: a.string(),
  //     categoryIds: a.string().array(), 
  //     sortBy: a.string(),
  //     from: a.integer(),    
  //     size: a.integer()
  //   })
  //   .returns(a.ref("PaginatedProductSearchResults"))
  //   .authorization((allow) => [allow.publicApiKey()])
  //   .handler(
  //     a.handler.custom({
  //       entry: "./searchProductsResolver.js",        dataSource: "osDataSource",
  //     })
  //   ),
    searchProducts: useOpenSearch
    ? // --- Rama VERDADERA: Usa OpenSearch ---
      a.query()
        .arguments({
          searchTerm: a.string(),
          categoryIds: a.string().array(),
          sortBy: a.string(),
          from: a.integer(),
          size: a.integer()
        })
        .returns(a.ref("PaginatedProductSearchResults"))
        .authorization((allow) => [allow.publicApiKey()])
        .handler(
          a.handler.custom({
            entry: "./searchProductsResolver.js",
            dataSource: "osDataSource",
          })
        )
    : // --- Rama FALSA: Usa DynamoDB ---
      a.query()
        .arguments({
          searchTerm: a.string(),
          categoryIds: a.string().array(),
          nextToken: a.string(),
          limit: a.integer(),
        })
        .returns(a.ref("PaginatedProductSearchResults"))
        .authorization((allow) => [allow.publicApiKey()])
        .handler(
          a.handler.custom({ // <-- Handler EXPLÍCITO, atado a DynamoDB
            entry: "./searchProductsDynamoResolver.js",
            dataSource: a.ref('Product') // <-- ¡AQUÍ ESTÁ LA MAGIA!
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

