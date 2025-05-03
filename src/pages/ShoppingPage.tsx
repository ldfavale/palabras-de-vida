import useGetProducts from "../hooks/useGetProducts";
import ShopItem from "../components/ShopItem";
import Sidebar from "../components/ShopSidebar";
import { ProductListSkeleton } from "../components/ProductListSkeleton";
import toast from "react-hot-toast";
import { useEffect } from "react";


function ShoppingPage() {
   const { products, loading, error } = useGetProducts();

  useEffect(() => {
    if (error?.message) {
        toast.error(`Error: ${error.message}`);
    }
  }, [error]);

  

  return (
    <div className="flex justify-center w-full  ">
      <div className="sm:flex flex-1 sm:flex-row  justify-center w-full lg:max-w-6xl ">      
        <Sidebar/>
        {loading && ( <ProductListSkeleton count={12} />) }

        {!loading && !error && products.length === 0 && (
             <div className="p-4 text-center text-gray-500">No se encontraron productos con esos criterios.</div>
        )}
        
         
        {!loading && !error && products.length > 0 && 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6"> 
          {(
          products.map((p) => (
            <ShopItem key={p.id} product={p} />
            ))
          )}
            </div>
        }
        {error && <div className="text-red-500 p-4">Error: {error.message}</div>}     
      </div>
    </div>
  );
}

export default ShoppingPage;
