import { util } from '@aws-appsync/utils';

const SPANISH_STOPWORDS = [
  "a", "al", "como", "con", "de", "del", "desde", "donde", "e", "el", "en", "entre", "es", "esta", "la", "las", "los", "para", "por", "que", "se", "sin", "un", "una", "y"
];

export function request(ctx) {
  const { searchTerm, categoryIds, sortBy, limit = 20, nextToken } = ctx.args;
  
  ctx.stash.sortBy = sortBy;
  ctx.stash.limit = limit;
  ctx.stash.nextToken = nextToken;
  
  if (!searchTerm) {
    return {
      operation: 'Scan',
      limit: limit
    };
  }

  // Tokenizar y evitar stopwords
  const tokens = searchTerm.toLowerCase().split(' ');
  let firstToken = tokens[0];
  
  // Verificar si el primer token es stopword y usar el segundo si existe
  if (tokens.length > 1 && SPANISH_STOPWORDS.includes(tokens[0]) && tokens[1].length > 2) {
    firstToken = tokens[1];
  }
  
  const query = {
    operation: 'Query',
    query: {
      expression: '#token = :token',
      expressionNames: {
        '#token': 'token'
      },
      expressionValues: {
        ':token': util.dynamodb.toDynamoDB(firstToken)
      }
    },
    limit: limit
  };

  // Filtro simple por categoría
  if (categoryIds && categoryIds.length > 0) {
    query.filter = {
      expression: 'contains(categoryIds, :catId)',
      expressionValues: {
        ':token': util.dynamodb.toDynamoDB(firstToken),
        ':catId': util.dynamodb.toDynamoDB(categoryIds[0])
      }
    };
  }

  return query;
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const items = ctx.result.items || [];
  
  // Aplicar límite simple
  const limit = ctx.stash.limit || 20;
  const limitedItems = items.slice(0, limit);
  
  const finalItems = limitedItems.map(item => ({
    id: item.productId,
    title: item.normalizedTitle || '',
    price: item.price || 0,
    categoryIds: item.categoryIds || [],
    createdAt: item.createdAt
  }));

  return {
    items: finalItems,
    totalCount: finalItems.length
  };
}