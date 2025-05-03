const ProductSkeletonItem = () => (
    <div className="rounded-md  w-full mx-auto animate-pulse">
      {/* Placeholder para la imagen del producto */}
      <div className="bg-gray-300 h-48 w-full rounded-md mb-4"></div>
  
      {/* Placeholder para el nombre del producto */}
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 p-4"></div>
  
      {/* Placeholder para la descripción corta o categoría */}
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4 pt-4"></div>
  
      {/* Placeholder para el precio */}
      <div className="h-4 bg-gray-300 rounded w-1/4 py-4"></div>
    </div>
  );
  
  // Componente principal que muestra una cuadrícula de esqueletos de producto
  export const ProductListSkeleton = ({ count = 8 }) => {
    // Crea un array con 'count' elementos para mapear y renderizar los esqueletos
    const skeletonItems = Array.from({ length: count });
  
    return (
      <div className="container w-full mx-auto px-4 py-8 pt-32">
        {/* Cuadrícula responsiva para mostrar los esqueletos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6">
          {/* Mapea el array y renderiza un ProductSkeletonItem por cada elemento */}
          {skeletonItems.map((_, index) => (
            <ProductSkeletonItem key={index} />
          ))}
        </div>
      </div>
    );
  };