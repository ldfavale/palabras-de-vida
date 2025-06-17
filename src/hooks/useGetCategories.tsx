import { useEffect, useState, useCallback } from "react";
import { fetchCategories } from "../services/dataService";
import type { Schema } from '../../amplify/data/resource'

type Category = Schema['Category']['type'];

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useGetCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await fetchCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { categories, loading, error, refetch };
}

export default useGetCategories;