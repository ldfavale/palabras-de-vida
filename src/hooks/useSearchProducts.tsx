import { useCallback, useEffect, useRef, useState } from "react";
import { ProductFromSearch, searchProducts } from "../services/dataService"; // Asegúrate que la ruta sea correcta

// Interfaces UseProductsResult y UseSearchProductsParams (como las tenías, parecen bien)
interface UseProductsResult {
  products: ProductFromSearch[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  totalPages: number;
  pageSize: number; // Exponer pageSize también puede ser útil
  refetch: () => void;
}

export interface UseSearchProductsParams {
  searchTerm: string;
  categoryIds: string[]; // Asumiendo que esto viene memoizado del padre (ShoppingPage)
  sortBy?: string;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 9; // O el valor que prefieras

function useSearchProducts({
  searchTerm,
  categoryIds,
  sortBy,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseSearchProductsParams): UseProductsResult {
  const [products, setProducts] = useState<ProductFromSearch[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPageInternal] = useState(1); 
  const refetchIndex = useRef(0);

  // Función estable para buscar productos
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resultData, errors } = await searchProducts({
        searchTerm,
        categoryIds,
        sortBy,
        page: currentPage,
        limit: pageSize,
      });

      if (errors) {
        console.error("useSearchProducts: Error reportado por searchProducts service:", errors);
        setError(new Error('Fallo al obtener productos debido a error del servicio.'));
        setProducts([]);
        setTotalCount(0);
      } else if (resultData && resultData.items) {
        const validItems = resultData.items.filter(
          (item): item is ProductFromSearch => item != null
        );
        setProducts(validItems);
        setTotalCount(resultData.totalCount || 0);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("useSearchProducts: Error en bloque catch:", err);
      setError(err as Error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryIds, sortBy, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPageInternal(1);
  }, [searchTerm, categoryIds, sortBy]); 

  useEffect(() => {
    fetchProducts();
    // refetchIndex.current se usa solo para forzar el refetch
  }, [fetchProducts, refetchIndex.current]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const setCurrentPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages || 1)); 
      setCurrentPageInternal(newPage);
    },
    [totalPages] 
  );

  // Método refetch expuesto
  const refetch = useCallback(() => {
    refetchIndex.current += 1;
  }, []);

  return {
    products,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    pageSize, 
    refetch,
  };
}

export default useSearchProducts;