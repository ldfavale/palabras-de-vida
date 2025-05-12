import { util } from '@aws-appsync/utils';

/**
 * Searches for documents by using an input term and filters by categories
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  // const { searchTerm, categoryIDs } = ctx.args;
  const { searchTerm } = ctx.args; // Obtenemos los argumentos

  const queries = []; 
  const filters = []; 

  // 1. Búsqueda por término en title y description (si se proporciona searchTerm)
  if (searchTerm && searchTerm.trim() !== '') {
    queries.push({
      multi_match: {
        query: searchTerm,
        fields: ["title", "description"] // Campos donde buscar
      }
    });
  } else {
    queries.push({ match_all: {} });
  }

  // 2. Filtrado por categoryIDs 
  // if (categoryIDs && categoryIDs.length > 0) {
  //   filters.push({
  //     terms: { 
  //       "categoryIds": categoryIDs 
  //     }
  //   });
  // }

  // Construir la query final de OpenSearch
  const requestBody = {
    from: ctx.args.from || 0, 
    size: ctx.args.size || 50,
    query: {
      bool: {}
    }
  };

  // Solo añadir 'must' si hay queries (searchTerm)
  if (queries.length > 0) {
    requestBody.query.bool.must = queries;
  } else {
    // Si no hay término de búsqueda pero sí filtros, necesitamos un 'match_all' para que los filtros apliquen.
    // O si no hay ni término ni filtros, un 'match_all' para devolver todo (considera el rendimiento).
    if (filters.length === 0) { // Sin término y sin filtros
        requestBody.query.bool.must = { match_all: {} }; // Opcional: devuelve todo, considera implicaciones
    }
    // Si hay filtros pero no término, los filtros solos en la cláusula 'filter' funcionarán.
  }


  // Solo añadir 'filter' si hay filtros (categoryIDs)
  if (filters.length > 0) {
    requestBody.query.bool.filter = filters;
  }

  // Si no hay 'must' (ni searchterm ni match_all) y no hay 'filter',
  // la query bool vacía podría ser un error o devolver todo dependiendo de OpenSearch.
  // Es más seguro asegurar que siempre haya al menos un match_all si no hay otras condiciones.
  if (queries.length === 0 && filters.length === 0) {
      requestBody.query.bool.must = { match_all: {} };
  }


  console.log('OpenSearch request body:', JSON.stringify(requestBody, null, 2));

  return {
    operation: 'GET',
    path: `/product/_search`, // Asegúrate que 'product' es tu índice correcto
    params: {
      body: requestBody
    }
  };
}

/**
 * Returns the fetched items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
  if (ctx.error) {
    console.error('Error from OpenSearch:', ctx.error.message);
    util.error(ctx.error.message, ctx.error.type);
  }
  // console.log('OpenSearch response:', JSON.stringify(ctx.result, null, 2));
  return ctx.result.hits.hits.map((hit) => hit._source);
}