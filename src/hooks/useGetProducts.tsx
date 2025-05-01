import { useEffect, useState } from "react";
import fetchProducts, { type ProductWithCategories } from "../services/dataService";

interface UseProductsResult {
  products: ProductWithCategories[];
  loading: boolean;
  error: Error | null;
}

function useGetProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data: fetchedProducts, errors } = await fetchProducts(); // Captura también los errores si los hay

        if (errors) {
           console.error("Error reported by fetchProducts service:", errors);
           setError(new Error('Failed to fetch products due to service error.'));
           setProducts([]); 
        } else {
          setProducts(fetchedProducts || []); 
        }

      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  return { products, loading, error };
}

export default useGetProducts;
