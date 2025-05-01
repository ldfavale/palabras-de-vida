import { useEffect, useState } from "react";
import { fetchCategories } from "../services/dataService";
import type { Schema } from '../../amplify/data/resource'
type Category = Schema['Category']['type'];

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
}

function useGetCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  return { categories, loading, error };
}

export default useGetCategories;
