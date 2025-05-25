// src/hooks/useDeleteProduct.ts
import { useState, useCallback } from 'react';
import { removeProduct, DeleteProductResponse } from '../services/dataService'; // Ajusta la ruta
import toast from 'react-hot-toast';

interface UseDeleteProductReturn {
  deleteProduct: (productId: string, productTitle: string) => Promise<boolean>;
  isDeleting: boolean;
  error: Error | null | any[]; 
}

/**
 * Hook para manejar la lógica de borrado de un producto.
 * @param onSuccess - Callback opcional que se ejecuta tras un borrado exitoso, recibe el ID del producto borrado.
 */
function useDeleteProduct(onSuccess?: (deletedProductId: string) => void): UseDeleteProductReturn {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null | any[]>(null);

  const deleteProduct = useCallback(async (productId: string, productTitle: string): Promise<boolean> => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto "${productTitle}"? Esta acción no se puede deshacer.`)) {
      return false;
    }

    setIsDeleting(true);
    setError(null);
    const toastId = `delete-toast-${productId}`; // ID único para el toast
    toast.loading(`Eliminando "${productTitle}"...`, { id: toastId });

    try {
      const response: DeleteProductResponse = await removeProduct(productId);

      if (response.success) {
        setIsDeleting(false);
        if (onSuccess && response.productId) {
          onSuccess(response.productId);
        }
        return true;
      } else {
        const errorMessages = response.errors?.map(e => e.message || 'Error desconocido').join(', ') || 'Error al eliminar.';
        toast.error(`Error: ${errorMessages}`, { id: toastId });
        setError(response.errors || new Error(errorMessages));
        setIsDeleting(false);
        return false;
      }
    } catch (apiError: any) {
      toast.error(`Error de API: ${apiError.message || 'Error al conectar con el servidor.'}`, { id: toastId });
      setError(apiError);
      setIsDeleting(false);
      return false;
    }
  }, [onSuccess]);

  return { deleteProduct, isDeleting, error };
}

export default useDeleteProduct;