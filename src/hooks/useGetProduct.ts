import { useEffect, useState } from "react";
import { fetchProductById, type ProductWithCategories } from "../services/dataService";

interface UseProductResult {
  product: ProductWithCategories | null;
  loading: boolean;
  error: Error | null;
}

function useGetProduct(productId: string | undefined): UseProductResult {
  const [product, setProduct] = useState<ProductWithCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Si no hay productId, no hacer la petición
    if (!productId) {
      setLoading(false);
      setError(new Error('Product ID is required'));
      return;
    }

    const getProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: fetchedProduct, errors } = await fetchProductById(productId);

        if (errors) {
          console.error("Error reported by fetchProductById service:", errors);
          setError(new Error('Failed to fetch product due to service error.'));
          setProduct(null);
        } else if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError(new Error('Product not found'));
          setProduct(null);
        }

      } catch (err) {
        console.error("Error in useGetProduct:", err);
        setError(err as Error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]); // Se ejecuta cuando cambia el productId

  return { product, loading, error };
}

export default useGetProduct;