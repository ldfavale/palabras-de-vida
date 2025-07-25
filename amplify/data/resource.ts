import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';

const useOpenSearch = process.env.USE_OPENSEARCH === 'true';

// Define the schema object separately to be able to reference it in function definitions
const schema = a.schema({
  searchProducts: useOpenSearch
    ? a
        .query()
        .arguments({
          searchTerm: a.string(),
          categoryIds: a.string().array(),
          sortBy: a.string(),
          from: a.integer(),
          size: a.integer(),
        })
        .returns(a.ref('PaginatedProductSearchResults'))
        .authorization((allow) => [allow.publicApiKey()])
        .handler(
          a.handler.custom({
            entry: './searchProductsResolver.js',
            dataSource: 'osDataSource',
          })
        )
    : a
        .query()
        .arguments({
          searchTerm: a.string(),
          categoryIds: a.string().array(),
          sortBy: a.string(),
          nextToken: a.string(),
        })
        .returns(a.ref('PaginatedProductSearchResults'))
        .authorization((allow) => [allow.publicApiKey()])
        .handler(
          a.handler.custom({
            entry: './searchProductsDynamoResolver.js',
            dataSource: a.ref('ProductSearchToken')
          })
        ),

  Product: a
    .model({
      title: a.string().required(),
      normalizedTitle: a.string(),
      description: a.string(),
      images: a.string().array(),
      code: a.string(),
      price: a.float(),
      categoryIds: a.string().array(),
      categories: a.hasMany('ProductCategory', 'productId'),
      searchTokens: a.hasMany('ProductSearchToken', 'productId'),
      searchableStatus: a.string(),
      // The 'triggers' property was removed from here as it was incorrect.
      // The trigger is now correctly defined on the function itself.
    })
    .authorization(allow => [allow.publicApiKey()])
    .secondaryIndexes((index: any) => [
      index('searchableStatus')
        .sortKeys(['normalizedTitle'])
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
      productStatus: a.string(),
      productTitle: a.string(),
      productPrice: a.float(),
      productCreatedAt: a.datetime(),
    })
    .authorization(allow => [allow.publicApiKey()])
    .secondaryIndexes((index: any) => [
      index('productId').queryField('productCategoriesByProductId'),
      index('categoryId').sortKeys(['productTitle']).queryField('productsByCategoryIdAndTitle'),
      index('categoryId').sortKeys(['productPrice']).queryField('productsByCategoryIdAndPrice'),
      index('categoryId').sortKeys(['productCreatedAt']).queryField('productsByCategoryIdAndCreatedAt')
    ]),

  ProductSearchToken: a
    .model({
      token: a.string().required(),
      productId: a.id().required(),
      product: a.belongsTo('Product', 'productId'),
      
      // Denormalized fields for search optimization
      title: a.string(), // <-- AÑADIDO
      categoryIds: a.string().array(),
      price: a.float(),
      images: a.string().array(),
      description: a.string(),
      normalizedTitle: a.string(),
      createdAt: a.datetime(),
    })
    .identifier(['token', 'productId'])
    .authorization(allow => [allow.publicApiKey()])
    .secondaryIndexes((index: any) => [
      index('productId').queryField('tokensByProductId'),
    ]),

  HighlightDetail: a.customType({
    title: a.string().array(),
    description: a.string().array(),
    code: a.string().array(),
  }),

  ProductSearchResultItem: a.customType({
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

  searchProductsByTitle: a.query()
      .arguments({
        searchTerm: a.string().required(),
        categoryIds: a.string().array(),
        nextToken: a.string(),
        limit: a.integer(),
      })
      .returns(a.ref("PaginatedProductSearchResults"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          entry: "./searchProductsByTitleResolver.js",
          dataSource: a.ref('Product')
        })
      ),

  searchProductsByCategory: a.query()
      .arguments({
        categoryId: a.id().required(),
        sortBy: a.string(),
        nextToken: a.string(),
        limit: a.integer(),
      })
      .returns(a.ref("PaginatedProductSearchResults"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          entry: "./searchProductsByCategoryResolver.js",
          dataSource: a.ref('ProductCategory')
        })
      ),
});

export const data = defineData({
  schema: schema, // Pass the schema object here
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});

export type Schema = ClientSchema<typeof schema>; // Reference the new schema constant