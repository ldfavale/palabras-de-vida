import type { Schema } from '../../amplify/data/resource'
import { generateClient, SelectionSet } from 'aws-amplify/data'
import { uploadData } from 'aws-amplify/storage';

const client = generateClient<Schema>()

type Category = Schema['Category']['type'];
type Product = Schema['Product']['type'];

interface FetchCategoriesResponse {
  data:  Category[] | null;
  errors?: any
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
  'categories.category.label'
] as const;

export type ProductWithCategories = SelectionSet<Schema['Product']['type'], typeof selectionSet>;
interface FetchProductsResponse {
  data:  ProductWithCategories[] | null;
  errors?: any
}

export interface ProductRequestData {
  title: string;
  description: string | undefined;
  categories: string[];
  images: File[]; // File array for images
  code: string;
  price: number;
}
export interface CategoryRequestData {
  name: string;
  label?: string;
}


// Now you should be able to make CRUDL operations with the
// Data client


export const fetchProducts = async (): Promise<FetchProductsResponse> => {
    try {
      const response = await client.models.Product.list({selectionSet});
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { data: null, errors: error };
    }
};

export const fetchCategories = async (): Promise<FetchCategoriesResponse> => {
    try {
      const response = await client.models.Category.list();
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { data: null, errors: error };
    }
};

const uploadImages = async ( images: File[] ) => {
  try {
    const uploadPromises = images.map((file) =>
      uploadData({
        path: `product-images/${file.name}`,
        data: file,
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    const uploadedImagePaths = await Promise.all(
      uploadResults.map(async (upload) => {
        const resolvedResult = await upload.result; // Resolve the promise
        return resolvedResult.path; // Adjust based on the structure of the resolved result
      })
      );
      
    return uploadedImagePaths
     
  }catch (error) {
    console.error("Error uploading images:", error);
  }
};

export const createProduct = async (data: ProductRequestData): Promise<void> => {
  try {
    if (data.images) {
      const images = [...data.images];
      const uploadedImagesPaths = await uploadImages(images);
      if (uploadedImagesPaths) {
        const createdProduct = await client.models.Product.create({
          title: data.title,
          description: data.description,
          images: uploadedImagesPaths,
          code: data.code,
          price: Number(data.price), 
        });

        const productId = createdProduct.data?.id;
        if (data.categories && productId) {
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
      }
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
      }
  catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
};

const formatLabel = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-');
};

  export default fetchProducts