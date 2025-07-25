import { util } from '@aws-appsync/utils';

// =================================================================
// C O N S T A N T E S
// =================================================================
const PRODUCT_BY_STATUS_AND_TITLE_INDEX = 'productsBySearchableStatusAndNormalizedTitle';

/**
 * Resolvedor para la consulta `searchProductsByTitle`.
 * Busca en la tabla `Product` utilizando el GSI para títulos.
 */
export function request(ctx) {
  const { searchTerm, categoryIds, limit = 12, nextToken } = ctx.args;

  const query = {
    expression: '#status = :status AND begins_with(#title, :title)',
    expressionNames: {
      '#status': 'searchableStatus',
      '#title': 'normalizedTitle',
    },
    expressionValues: {
      ':status': util.dynamodb.toDynamoDB('ACTIVE'),
      ':title': util.dynamodb.toDynamoDB(searchTerm.toLowerCase().trim()),
    },
  };

  // Opcional: Añadir filtro de categoría a la query principal.
  // Es un FilterExpression, pero es eficiente porque se aplica sobre el resultado del Query.
  if (categoryIds && categoryIds.length > 0) {
    query.expression += ' AND contains(#categoryIds, :categoryId)';
    query.expressionNames['#categoryIds'] = 'categoryIds';
    query.expressionValues[':categoryId'] = util.dynamodb.toDynamoDB(categoryIds[0]);
  }

  return {
    operation: 'Query',
    index: PRODUCT_BY_STATUS_AND_TITLE_INDEX,
    query: query,
    limit,
    nextToken,
  };
}

/**
 * Formatea la respuesta. Los ítems ya vienen de la tabla Product, así que están completos.
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    items: ctx.result.items,
    totalCount: -1, // Sigue siendo una limitación de Query
    nextToken: ctx.result.nextToken,
  };
}