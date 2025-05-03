import Slider from './Slider';
import type { Schema } from '../../amplify/data/resource'
import { useEffect } from 'react';
import type { ProductWithCategories } from '../services/dataService';


interface ShopItemProps {
    product: ProductWithCategories;
  }
  
function ShopItem({product}:ShopItemProps) {
    const images = product.images ? product.images.filter(Boolean) as string[] : [];

    useEffect(() => {

    },[])

  return (
    <div className=" bg-white w-full rounded-md overflow-hidden mx-auto  sm:hover:[box-shadow:0_0_12px_rgba(0,0,0,.15)]  ">
        <div className="flex flex-col">
            <div className=' flex h-[231px]  items-center justify-center'>
                    {product.images && <Slider
                        key={product.code}
                        paths={images}
                        containerClassName=" h-full w-full flex" 
                        imageClassName="h-full w-full object-cover"
                    />}
            </div>
            {/* Add to cart button*/}
            <div className=' -mt-6 flex items-end justify-end pr-4'>
                <div className='rounded-full bg-primary border  border-white p-2 z-10'>
                    <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/>
                    </svg>
                </div>
            </div>
        </div>
         {/* Product Information */}

        <div className=" p-4">
            <p className="font-graphik font-medium text-black mb-2 max-h-12 overflow-hidden">{product.title}</p>
            <div className="flex flex-row  justify-between w-full mb-1 [&>span]:text-lightgrey [&>span]:font-thin  [&>span]:text-xs">
                {
                product.categories.map((productCategory)=> {
                    return <span>{productCategory.category.name}</span>
                    })
                    
        }
                <span>COD: {product.code}</span>
            </div>
            <div className="font-medium text-primary mb-1">UYU {product.price}</div>
            <p className="font-graphik text-xs text-black mb-2 max-h-24 overflow-hidden">
             {product.description}
            </p>
        </div>
  </div>
  )
}

export default ShopItem