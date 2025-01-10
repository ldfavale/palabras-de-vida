import { useEffect, useState } from "react";
import fetchProducts from "../services/dataService";
import type { Schema } from '../../amplify/data/resource'
type Product = Schema['Product']['type'];

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data: fetchedProducts } = await fetchProducts();
        setProducts(fetchedProducts || []);
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

export default useProducts;
