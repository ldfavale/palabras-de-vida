import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient<Schema>()



// Now you should be able to make CRUDL operations with the
// Data client
export const fetchProducts = async () => {
    try {
      const response = await client.models.Product.list();
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { data: null, errors: error };
    }
};



export const createProduct = async () => {
    const product = await client.models.Product.create({
      title: "Titulo 2",
      description: "Este es otro  producto",
      category: "Categoria 1",
      image: "Hola soy una imagen diferente",
      code: "749296202662",
      price: "530"
    })
    console.log("createdProduct",createProduct)
  }

  export default fetchProducts