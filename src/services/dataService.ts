import type { Schema } from '../../amplify/data/resource';
import { generateClient, SelectionSet } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';

const client = generateClient<Schema>();
const USE_OPENSEARCH = import.meta.env.VITE_USE_OPENSEARCH === 'true';

// --- Tipos Generales y para Operaciones CRUD ---
type Category = Schema['Category']['type'];
type Product = Schema['Product']['type'];

interface FetchCategoriesResponse {
  data: Category[] | null;
  errors?: any;
}

export const selectionSet = [
  'id',
  'title',
  'description',
  'images',
  'code',
  'price',
  'categories.category.id',
  'categories.category.name',
  'categories.category.label',
] as const;

export type ProductWithCategories = SelectionSet<Schema['Product']['type'], typeof selectionSet>;

interface FetchProductsResponse {
  data: ProductWithCategories[] | null;
  errors?: any;
}

export interface ProductRequestData {
  title: string;
  description: string | undefined;
  categories: string[];
  images: File[];
  code: string;
  price: number;
}

export interface CategoryRequestData {
  name: string;
  label?: string;
}

// --- Tipos Específicos para Búsqueda de Productos con Resaltado y Paginación ---

type HighlightSnippetsArray = (string | null)[];

interface ProductHighlightData {
  title?: HighlightSnippetsArray | null;
  description?: HighlightSnippetsArray | null;
  code?: HighlightSnippetsArray | null;
}

export type ProductFromSearch = {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly images?: (string | null)[] | null;
  readonly code?: string | null;
  readonly price?: number | null;
  readonly categoryIds?: (string | null)[] | null;
  highlight?: ProductHighlightData | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

interface PaginatedProductsData {
  items: (ProductFromSearch | null | undefined)[];
  totalCount: number;
  nextToken?: string | null;
}

interface SearchProductsResponse {
  data: PaginatedProductsData | null | undefined;
  errors?: any;
}

interface SearchParams {
  searchTerm?: string;
  categoryIds?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
  nextToken?: string | null;

}

// --- Funciones del Servicio ---

export const fetchProducts = async (): Promise<FetchProductsResponse> => {
  try {
    const response = await client.models.Product.list({ selectionSet });
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: null, errors: error as any };
  }
};

interface GetProductResponse {
  data: ProductWithCategories | null;
  errors?: any;
}

export async function fetchProductById(productId: string): Promise<GetProductResponse> {
  try {
    // Reemplaza esta URL con tu endpoint real
    const response = await client.models.Product.get({id: productId},{ selectionSet});
    console.log("Response from fetchProductById:", response)

   
    return { data: response.data };
  

  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return {
      data: null,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

export const searchProducts = async (params: SearchParams): Promise<SearchProductsResponse> => {
  console.log(`Modo de búsqueda: ${USE_OPENSEARCH ? 'OpenSearch' : 'DynamoDB'}`);

  try {
    type QueryArgs = Parameters<typeof client.queries.searchProducts>[0];
    
    let queryArgs: QueryArgs;

    if (USE_OPENSEARCH) {
      const from = params.page && params.limit ? (params.page - 1) * params.limit : 0;
      queryArgs = {
        searchTerm: params.searchTerm || undefined,
        categoryIds: params.categoryIds && params.categoryIds.length > 0 ? params.categoryIds : undefined,
        sortBy: params.sortBy || undefined,
        from: from,
        size: params.limit,
      };
    } else {
      queryArgs = {
        searchTerm: params.searchTerm || undefined,
        categoryIds: params.categoryIds && params.categoryIds.length > 0 ? params.categoryIds : undefined,
        limit: params.limit,
        nextToken: params.nextToken || undefined, 
      };
    }

    const gqlResponse = await client.queries.searchProducts(queryArgs);

    // FIX: Unmarshall DynamoDB data format directly in the frontend service
    if (gqlResponse.data && gqlResponse.data.items) {
      const processedItems = gqlResponse.data.items.map(item => {
        console.log("Item original:", item);
        if (!item) return null;

        // Check if images are in the DynamoDB marshalled format
        if (item.images && Array.isArray(item.images) && item.images.length > 0 && (item.images[0] as any)?.S) {
          return {
            ...item,
            images: item.images.map(img => (img as any).S)
          };
        }
        return item;
      });

      const processedData = {
        ...gqlResponse.data,
        items: processedItems,
      };

      return { data: processedData, errors: gqlResponse.errors };
    }

    return { data: gqlResponse.data ?? null, errors: gqlResponse.errors };

  } catch (error) {
    console.error("Error en searchProducts:", error);
    return { data: null, errors: error as any };
  }
};

export const fetchCategories = async (): Promise<FetchCategoriesResponse> => {
  try {
    const response = await client.models.Category.list();
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: null, errors: error as any };
  }
};

const uploadImages = async (images: File[]) => {
  try {
    const uploadPromises = images.map((file) =>
      uploadData({
        path: `product-images/${Date.now()}_${file.name}`, 
        data: file,
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    const uploadedImagePaths = await Promise.all(
      uploadResults.map(async (upload) => {
        const resolvedResult = await upload.result;
        return resolvedResult.path;
      })
    );
    return uploadedImagePaths;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error; 
  }
};

export const createProduct = async (data: ProductRequestData): Promise<void> => {
  try {
    let uploadedImagePaths: string[] | undefined = [];
    if (data.images && data.images.length > 0) {
      uploadedImagePaths = await uploadImages(data.images);
    }

    const createdProduct = await client.models.Product.create({
      title: data.title,
      description: data.description,
      images: uploadedImagePaths,
      code: data.code,
      price: Number(data.price),
    });

    const productId = createdProduct.data?.id;
    if (data.categories && data.categories.length > 0 && productId) {
      const categoryRelations = data.categories.map((categoryId) => ({
        productId: productId,
        categoryId,
      }));

      await Promise.all(
        categoryRelations.map((relation) =>
          client.models.ProductCategory.create(relation)
        )
      );
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};

export const createCategory = async (data: CategoryRequestData): Promise<void> => {
  try {
    await client.models.Category.create({
      name: data.name,
      label: formatLabel(data.name),
    });
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
};

const formatLabel = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Normaliza y quita acentos
};

export interface DeleteProductResponse {
  success: boolean;
  productId?: string;
  errors?: any[];
}

export const removeProduct = async (productId: string): Promise<DeleteProductResponse> => {
  try {
    console.log(`dataService: Deleting product with ID: ${productId}`);
    const response = await client.models.Product.delete({ id: productId });
    console.log("dataService: Response from deleteProduct mutation", response);

    // Verificar si la respuesta tiene data null pero no tiene errores (caso común cuando el producto no existe)
    if (response.data === null && !response.errors) {
      console.warn(`Product with ID ${productId} might not exist or was already deleted`);
      // Podemos considerar esto como éxito ya que el producto no existe (que era el objetivo)
      return { success: true, productId, errors: undefined };
    }

    if (response.errors) {
      console.error("GraphQL errors during product deletion:", response.errors);
      return { success: false, productId, errors: response.errors };
    }
   return { success: true, productId, errors: undefined };

  } catch (error) {
    console.error(`Catch block: Error deleting product ${productId} in dataService:`, error);
    return { success: false, productId, errors: [error as any] };
  }
};

