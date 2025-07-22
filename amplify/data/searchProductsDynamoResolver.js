import { util } from '@aws-appsync/utils';

const SPANISH_STOPWORDS = [
  "a", "al", "como", "con", "de", "del", "desde", "donde", "e", "el", "en", "entre", "es", "esta", "la", "las", "los", "para", "por", "que", "se", "sin", "un", "una", "y"
];

export function request(ctx) {
  const { searchTerm, categoryIds, sortBy, limit = 20, nextToken } = ctx.args;

  // Stash variables for the response function
  ctx.stash.sortBy = sortBy;
  ctx.stash.limit = limit;
  ctx.stash.nextToken = nextToken;

  let filter;
  // --------------------------------------------------------------------------
  // PASO 1: Construir el filtro de categorías de forma dinámica y aislada.
  // Esta lógica ahora soporta múltiples categorías.
  // --------------------------------------------------------------------------
  if (categoryIds && categoryIds.length > 0) {
    const filterParts = [];
    const expressionValues = {};
    categoryIds.forEach((id, index) => {
      const key = `:catId${index}`;
      filterParts.push(`contains(categoryIds, ${key})`);
      expressionValues[key] = util.dynamodb.toDynamoDB(id);
    });
    
    filter = {
      expression: filterParts.join(' or '),
      expressionValues: expressionValues
    };
  }

  // --------------------------------------------------------------------------
  // PASO 2: Decidir la operación principal (Query o Scan) según el searchTerm.
  // --------------------------------------------------------------------------
  if (searchTerm) {
    // --- CASO A: Hay término de búsqueda -> Usamos QUERY (más eficiente) ---
    
    const tokens = searchTerm.toLowerCase().split(' ');
    let firstToken = tokens[0];
    if (tokens.length > 1 && SPANISH_STOPWORDS.includes(tokens[0]) && tokens[1].length > 2) {
      firstToken = tokens[1];
    }

    const query = {
      operation: 'Query',
      query: {
        expression: '#token = :token',
        expressionNames: { '#token': 'token' },
        expressionValues: {
          ':token': util.dynamodb.toDynamoDB(firstToken)
        }
      },
      limit: limit,
      nextToken: nextToken
    };

    // Si construimos un filtro de categoría, lo AÑADIMOS a la Query.
    if (filter) {
      query.filter = filter;
    }
    
    return query;

  } else {
    // --- CASO B: No hay término de búsqueda -> Usamos SCAN ---
    
    const scan = {
      operation: 'Scan',
      limit: limit,
      nextToken: nextToken
    };

    // Si construimos un filtro de categoría, lo AÑADIMOS al Scan.
    if (filter) {
      scan.filter = filter;
    }

    return scan;
  }
}


export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const items = ctx.result.items || [];
  
  // Deduplicación usando filter con indexOf
  const uniqueItems = items.filter((item, index) => {
    // Encontrar el primer índice donde aparece este productId
    const firstIndex = items.findIndex(i => i.productId === item.productId);
    // Solo mantener si este es el primer elemento con este productId
    return index === firstIndex;
  }).map(item => ({
    id: item.productId,
    title: item.normalizedTitle || '',
    price: item.price || 0,
    categoryIds: item.categoryIds || [],
    createdAt: item.createdAt || null,
    images: item.images || [],
    description: item.description || '',
    code: item.code || '',
    updatedAt: item.updatedAt || null,
  }));

  return {
    items: uniqueItems,
    totalCount: uniqueItems.length,
    nextToken: ctx.result.nextToken || null,
  };
}
