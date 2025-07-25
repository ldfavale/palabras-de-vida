import { util } from '@aws-appsync/utils';

// =================================================================
// C O N S T A N T E S    D E    Í N D I C E S
// =================================================================
const CATEGORY_BY_ID_AND_TITLE_INDEX = 'productCategoriesByCategoryIdAndProductTitle';
const CATEGORY_BY_ID_AND_PRICE_INDEX = 'productCategoriesByCategoryIdAndProductPrice';
const CATEGORY_BY_ID_AND_CREATED_AT_INDEX = 'productCategoriesByCategoryIdAndProductCreatedAt';

/**
 * Resolvedor para la consulta `searchProductsByCategory`.
 * Busca en la tabla `ProductCategory` utilizando los GSIs de categoría.
 */
export function request(ctx) {
  const { categoryId, sortBy = 'title_asc', limit = 12, nextToken } = ctx.args;

  let indexName = CATEGORY_BY_ID_AND_TITLE_INDEX; // Default sort
  let scanIndexForward = true; // Default a A-Z, Menor a Mayor, etc.

  switch (sortBy) {
    case 'price_asc':
      indexName = CATEGORY_BY_ID_AND_PRICE_INDEX;
      scanIndexForward = true;
      break;
    case 'price_desc':
      indexName = CATEGORY_BY_ID_AND_PRICE_INDEX;
      scanIndexForward = false;
      break;
    case 'created_at_desc':
      indexName = CATEGORY_BY_ID_AND_CREATED_AT_INDEX;
      scanIndexForward = false;
      break;
    case 'created_at_asc':
      indexName = CATEGORY_BY_ID_AND_CREATED_AT_INDEX;
      scanIndexForward = true;
      break;
    case 'title_desc':
      indexName = CATEGORY_BY_ID_AND_TITLE_INDEX;
      scanIndexForward = false;
      break;
    case 'title_asc':
    default:
      indexName = CATEGORY_BY_ID_AND_TITLE_INDEX;
      scanIndexForward = true;
      break;
  }

  return {
    operation: 'Query',
    index: indexName,
    query: {
      expression: '#categoryId = :categoryId',
      expressionNames: { '#categoryId': 'categoryId' },
      expressionValues: { ':categoryId': util.dynamodb.toDynamoDB(categoryId) },
    },
    limit,
    nextToken,
    scanIndexForward,
  };
}

/**
 * Formatea la respuesta. Los ítems vienen de `ProductCategory`.
 * El cliente necesitará "hidratar" estos datos para obtener los detalles completos.
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const items = ctx.result?.items || [];

  // Transformamos los datos para que coincidan con el tipo `ProductSearchResultItem`
  const resultItems = items.map(item => ({
      id: item.productId, // Devolvemos el ID del producto
      // Incluimos los datos denormalizados que ya tenemos
      title: item.productTitle,
      price: item.productPrice,
      createdAt: item.productCreatedAt,
      // Dejamos claro que el resto de los datos no están aquí
      description: null,
      images: [],
      code: null,
      categoryIds: [item.categoryId], // Sabemos la categoría que se buscó
      updatedAt: null,
      highlight: null, // No hay resaltado en la búsqueda de DynamoDB
    }));

  return {
    items: resultItems,
    totalCount: -1, // Sigue siendo una limitación de Query
    nextToken: ctx.result.nextToken,
  };
}