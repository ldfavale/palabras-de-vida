import useGetProducts from "../hooks/useGetProducts";
import ShopItem from "../components/ShopItem";
import Sidebar from "../components/ShopSidebar";

function ShoppingPage() {
  const { products, loading, error } = useGetProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;

  return (
    <div className="flex items-center justify-center  ">
      <div className="md:flex md:flex-row md:items-center md:justify-center md:max-w-7xl ">      
        <Sidebar/>
        <div className="w-full lg:w-[80%] p-0 sm:p-5 pt-28 sm:pt-28 flex flex-col flex-wrap sm:flex-row items-center sm:items-center sm:justify-center lg:justify-start min-h-screen space-y-4 sm:space-y-0 " >
          {products.map((p) => (
            <ShopItem key={p.id} product={p} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default ShoppingPage;
