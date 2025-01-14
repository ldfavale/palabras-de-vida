import { useState } from "react";
import { createProduct } from "../services/dataService";
import type { Schema } from '../../amplify/data/resource'
type Product = Schema['Product']['type'];

interface UseCreateProductResult {
  loading: boolean;
  error: Error | null;
  success: boolean;
  create: (data: Product) => Promise<void>;
}

function useCreateProduct(): UseCreateProductResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const create = async (data: Product) => {
    setLoading(true);
    setError(null);
    try {
      await createProduct(data);
      setSuccess(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, create };
}

export default useCreateProduct;
