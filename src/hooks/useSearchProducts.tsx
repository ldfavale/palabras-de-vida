import { useEffect, useState } from "react";
import { ProductFromSearch, searchProducts } from "../services/dataService";

interface UseProductsResult {
  products: ProductFromSearch[];
  loading: boolean;
  error: Error | null;
}

export interface UseSearchProductsParams {
  searchTerm: string,
  categoryIds: string[]
}

function useSearchProducts({searchTerm, categoryIds}:UseSearchProductsParams): UseProductsResult {
  const [products, setProducts] = useState<ProductFromSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const { data: fetchedProducts, errors } = await searchProducts({ searchTerm, categoryIds}); // Captura también los errores si los hay

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
  }, [searchTerm,categoryIds]);

  return { products, loading, error };
}

export default useSearchProducts;
