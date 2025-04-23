import ProductForm from "../components/ProductForm"

function CreateProductPage() {


  return (

    <div className=" py-20 px-5 sm:px-10 md:px-16 lg:px-20 pt-48  space-y-10">
      <h1 className=' font-gilroy  text-6xl   lg:text-7xl  text-primary_light font-bold '>
      Nuevo Producto
            </h1>
      <ProductForm/>
    </div>
  );
}

export default CreateProductPage;
