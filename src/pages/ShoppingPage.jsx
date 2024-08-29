import { useEffect, useState } from "react";
import ShopItem from "../components/ShopItem";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../services';


function ShoppingPage() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'productos')).then((response) => {
      const items = response.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(items)
      setProducts(items);
    });
 
  }, []);

  return (
    <div className="  md:flex md:flex-row ">
      <div className="bg-red-400 h-screen w-80 hidden lg:flex"></div>
      <div className=" bg-green-400 h-5 w-full md:hidden"></div>
      <div className="w-full sm:p-5 pt-28 sm:pt-28 flex flex-col flex-wrap sm:flex-row items-center sm:items-start sm:justify-between min-h-screen " >
      { products.map(p => <ShopItem product={p}/>) }
        
      </div>
    </div>
  )
}

export default ShoppingPage