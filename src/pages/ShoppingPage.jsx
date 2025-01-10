import useProducts from "../hooks/useProducts";
import ShopItem from "../components/ShopItem";

function ShoppingPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;

  return (
    <div className="md:flex md:flex-row">
      <div className="bg-red-400 h-screen w-80 hidden lg:flex"></div>
      <div className="w-full sm:p-5 pt-28 sm:pt-28 flex flex-col flex-wrap sm:flex-row items-center sm:items-start sm:justify-between min-h-screen">
        {products.map((p) => (
          <ShopItem key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default ShoppingPage;
