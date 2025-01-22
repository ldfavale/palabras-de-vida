import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
// import { type Schema } from '@/amplify/data/resource';
import { uploadData } from 'aws-amplify/storage';

const client = generateClient<Schema>()

type Product = Schema['Product']['type'];

interface FetchProductsResponse {
  data:  Product[] | null;
  errors?: any
}

export interface ProductRequestData {
  title: string;
  description: string;
  category: string;
  images: File[]; // File array for images
  code: string;
  price: string;
}


// Now you should be able to make CRUDL operations with the
// Data client
export const fetchProducts = async (): Promise<FetchProductsResponse> => {
    try {
      const response = await client.models.Product.list();
      console.log(response)
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching products:", error);
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
    if(data.images){
      const images = [...data.images]
      const uploadedImagesPaths = await uploadImages(images); 
      if(uploadedImagesPaths){

        const createdProduct = await client.models.Product.create({
          title: data.title,
          description: data.description,
          category: data.category,
          images: uploadedImagesPaths,
          code: data.code,
          price: data.price,
        });
      }
  
    }
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};

  export default fetchProducts