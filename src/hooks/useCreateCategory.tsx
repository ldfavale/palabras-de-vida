import { useState } from "react";
import { CategoryRequestData, createCategory } from "../services/dataService";

interface UseCreateCategoryResult {
  loading: boolean;
  error: Error | null;
  success: boolean;
  create: (data: CategoryRequestData) => Promise<void>;
}

function useCreateCategory(): UseCreateCategoryResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const create = async (data: CategoryRequestData) => {
    setLoading(true);
    setError(null);
    try {
      await createCategory(data);
      setSuccess(true);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, create };
}

export default useCreateCategory;
