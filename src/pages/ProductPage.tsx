import { useParams, Link } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import useGetProduct from '../hooks/useGetProduct';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useGetProduct(id);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
        {/* Back button */}
        <Link 
          to="/tienda" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary_light mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a productos
        </Link>
        
        {/* Loading state */}
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
        {/* Back button */}
        <Link 
          to="/tienda" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary_light mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a productos
        </Link>
        
        {/* Error state */}
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Error al cargar el producto
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Ha ocurrido un error inesperado'}
            </p>
            <Link 
              to="/tienda"
              className="bg-primary hover:bg-primary_light text-white px-6 py-2 rounded-lg transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
        {/* Back button */}
        <Link 
          to="/tienda" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary_light mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a productos
        </Link>
        
        {/* Not found state */}
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Producto no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El producto que buscas no existe o ha sido eliminado
            </p>
            <Link 
              to="/tienda"
              className="bg-primary hover:bg-primary_light text-white px-6 py-2 rounded-lg transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 pt-32">
        <Link 
          to="/tienda" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary_light transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a productos
        </Link>
      </div>
      
      {/* Product detail */}
      <ProductDetail product={product} />
    </div>
  );
}

export default ProductPage;