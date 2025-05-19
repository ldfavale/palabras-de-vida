import { util } from '@aws-appsync/utils';

/**
 * Searches for documents by using an input term and filters by categories
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
  const { searchTerm, categoryIds, sortBy} = ctx.args;

  const queries = []; 
  const filters = []; 

  // 1. Búsqueda por término en title y description (si se proporciona searchTerm)
  if (searchTerm && searchTerm.trim() !== '') {
    queries.push({
      multi_match: {
        query: searchTerm,
        fields: ["title", "description"],
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
        "categoryIds": categoryIds 
      }
    });
  }

  // Construir la query final de OpenSearch
  const requestBody = {
    from: ctx.args.from || 0, 
    size: ctx.args.size || 12,
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

  if (queries.length > 0) {
    requestBody.query.bool.must = queries;
  } else if (filters.length === 0) {
    requestBody.query.bool.must = [{ match_all: {} }];
  }

  if (filters.length > 0) {
    requestBody.query.bool.filter = filters;
  }

  if (queries.length === 0 && filters.length === 0) {
      requestBody.query.bool.must = { match_all: {} };
  }

  // 3. Lógica para la Cláusula Sort 
  if (sortBy) {
    const sortOptions = [];
    if (sortBy === 'relevance') {
        if (searchTerm && searchTerm.trim() !== '') {
        sortOptions.push({ "_score": "desc" });
      } 
    } else if (sortBy === 'lowest-price') {
      sortOptions.push({ "price": "asc" }); 
    } else if (sortBy === 'highest-price') {
      sortOptions.push({ "price": "desc" });
    } else if (sortBy === 'a-z') {
      sortOptions.push({ "title.keyword": "asc" });
    } else if (sortBy === 'z-a') {
      sortOptions.push({ "title.keyword": "desc" });
    }
    else if (sortBy === 'newest') {
      sortOptions.push({ "createdAt": "desc" }); 
    } else if (sortBy === 'oldest') {
      sortOptions.push({ "createdAt": "asc" });
    }
    if (sortOptions.length > 0) {
      requestBody.sort = sortOptions;
    }
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
 
    const items = ctx.result.hits.hits.map((hit) => {
      const source = hit._source;
      const highlight = hit.highlight;
      const id = source.id || hit._id;
      return {
          ...source,
          id,
          highlight
        };
    });
    const totalCount = ctx.result.hits.total.value || 0; // Total de documentos que coinciden

    return { 
      items: items,
      totalCount: totalCount
    };
 
}