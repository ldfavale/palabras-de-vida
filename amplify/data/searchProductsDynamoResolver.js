import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { searchTerm, fallbackTerm, categoryIds, limit = 12, nextToken } = ctx.args;
  
  const cleanSearchTerm = searchTerm?.toLowerCase().trim();
  const hasSearchTerm = cleanSearchTerm && cleanSearchTerm.length > 0;
  const hasCategoryFilter = categoryIds?.length > 0;
  
  let requestObject;
  
  // Caso 1: Hay searchTerm - usa Query en el índice
  if (hasSearchTerm) {
    const query = {
      expression: '#status = :status AND begins_with(#title, :title)',
      expressionNames: {
        '#status': 'searchableStatus',
        '#title': 'normalizedTitle',
      },
      expressionValues: {
        ':status': util.dynamodb.toDynamoDB('ACTIVE'),
        ':title': util.dynamodb.toDynamoDB(cleanSearchTerm),
      },
    };
    
    requestObject = {
      operation: 'Query',
      index: 'productsBySearchableStatusAndNormalizedTitle',
      query: query,
      limit: Math.min(limit, 15),
      scanIndexForward: false,
    };
  } 
  // Caso 2: No hay searchTerm pero hay filtros de categoría - usa Scan con filtro
  else if (hasCategoryFilter) {
    requestObject = {
      operation: 'Scan',
      filter: {
        expression: '#status = :status AND contains(#categoryIds, :categoryId)',
        expressionNames: { 
          '#status': 'searchableStatus',
          '#categoryIds': 'categoryIds' 
        },
        expressionValues: { 
          ':status': util.dynamodb.toDynamoDB('ACTIVE'),
          ':categoryId': util.dynamodb.toDynamoDB(categoryIds[0]) 
        }
      },
      limit: Math.min(limit, 15),
    };
  }
  // Caso 3: No hay searchTerm ni filtros - trae todo (solo ACTIVE)
  else {
    requestObject = {
      operation: 'Scan',
      filter: {
        expression: '#status = :status',
        expressionNames: { '#status': 'searchableStatus' },
        expressionValues: { ':status': util.dynamodb.toDynamoDB('ACTIVE') }
      },
      limit: Math.min(limit, 15),
    };
  }
  
  // Agregar nextToken si existe
  if (nextToken) {
    requestObject.nextToken = nextToken;
  }
  
  // Si hay searchTerm Y filtro de categoría, agregar el filtro adicional
  if (hasSearchTerm && hasCategoryFilter) {
    requestObject.filter = {
      expression: 'contains(#categoryIds, :categoryId)',
      expressionNames: { '#categoryIds': 'categoryIds' },
      expressionValues: { ':categoryId': util.dynamodb.toDynamoDB(categoryIds[0]) }
    };
  }
  
  return requestObject;
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  
  const items = ctx.result?.items || [];
  
  const resultItems = items
    .filter(item => item?.id)
    .map(item => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      images: item.images || [],
      code: item.code || '',
      price: item.price || 0,
      categoryIds: item.categoryIds || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  
  const hasSearchTerm = ctx.args.searchTerm?.trim();
  const strategy = hasSearchTerm ? 'begins_with' : 'scan';
  
  return {
    items: resultItems,
    totalCount: resultItems.length,
    nextToken: ctx.result?.nextToken,
    hasMore: resultItems.length >= (ctx.args.limit || 12),
    searchStrategy: strategy
  };
}