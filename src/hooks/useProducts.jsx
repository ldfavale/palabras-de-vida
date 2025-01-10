import { useState, useEffect } from "react";
import fetchProducts from "../services/dataService";

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: fetchedProducts } = await fetchProducts();
        setProducts(fetchedProducts || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { products, loading, error };
}

export default useProducts;
