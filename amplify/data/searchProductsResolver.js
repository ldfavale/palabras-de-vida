import { util } from '@aws-appsync/utils';

/**
 * Searches for documents by using an input term and filters by categories
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  const { searchTerm, categoryIds } = ctx.args;

  const queries = []; 
  const filters = []; 

  // 1. Búsqueda por término en title y description (si se proporciona searchTerm)
  if (searchTerm && searchTerm.trim() !== '') {
    queries.push({
      multi_match: {
        query: searchTerm,
        fields: ["title", "description","code"],
        type: "phrase_prefix" 
      }
    });
  } else {
    queries.push({ match_all: {} });
  }

  // 2. Filtrado por categoryIds 
  if (categoryIds && categoryIds.length > 0) {
    filters.push({
      terms: { 
        "categoryIds.keyword": categoryIds // TODO El ".keyword" es temporal. Para quitarlo hay que reindexar opensearch https://gemini.google.com/gem/450ab04c3e9f/bfd01f8c2efa2065
      }
    });
  }

  // Construir la query final de OpenSearch
  const requestBody = {
    from: ctx.args.from || 0, 
    size: ctx.args.size || 50,
    query: {
      bool: {}
    },
    highlight: { 
      pre_tags: ["<mark>"], 
      post_tags: ["</mark>"], 
      fields: {
        title: { number_of_fragments: 0 }, 
        description: {                   
          fragment_size: 150,          
          number_of_fragments: 1        
        },
        code: { number_of_fragments: 0 } 
      },
      require_field_match: true 
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


  // Solo añadir 'filter' si hay filtros (categoryIds)
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
  console.log('OpenSearch response:', JSON.stringify(ctx.result, null, 2));
  // return ctx.result.hits.hits.map((hit) => hit._source);
  return ctx.result.hits.hits.map((hit) => {
    const source = hit._source; // Los datos principales del producto
    const highlight = hit.highlight; // Los fragmentos resaltados (si los hay)

    // Aseguramos que el producto tenga un ID. OpenSearch _id es un fallback si no está en _source.
    // Es importante que tu _source (datos de DynamoDB) contenga el 'id' que usas en el frontend.
    const id = source.id || hit._id;

    return {
      ...source, // Mantenemos todos los campos originales del producto
      id,        // Aseguramos que el id esté presente
      highlight  // Añadimos el objeto de resaltado
    };
  });
}