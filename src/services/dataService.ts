import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'
// import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>()

type Product = Schema['Product']['type'];

interface FetchProductsResponse {
  data:  Product[] | null;
  errors?: any
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


export const createProduct = async (data: Product): Promise<void> => {
  try {
    const createdProduct = await client.models.Product.create({
      title: data.title,
      description: data.description,
      category: data.category,
      image: data.image,
      code: data.code,
      price: data.price,
    });

    console.log("Created Product:", createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};

  export default fetchProducts