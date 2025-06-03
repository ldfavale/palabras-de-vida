import type { Schema } from '../../amplify/data/resource';
import { generateClient, SelectionSet } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';

const client = generateClient<Schema>();

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

export const searchProducts = async ({
  searchTerm,
  categoryIds,
  sortBy,
  page = 1,
  limit = 12,
}: SearchParams): Promise<SearchProductsResponse> => {
  try {
    const from = (page - 1) * limit;
    const size = limit;

    const gqlResponse = await client.queries.searchProducts({
      searchTerm: searchTerm || undefined,
      categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
      sortBy: sortBy || undefined,
      from: from,
      size: size,
    });

    console.log("response en dataService (searchProducts)", gqlResponse);
    return { data: gqlResponse.data ?? null, errors: gqlResponse.errors };
  } catch (error) {
    console.error("Error searching products:", error);
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

