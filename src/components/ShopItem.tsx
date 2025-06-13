import Slider from './Slider';
import { useEffect } from 'react';
import type { ProductFromSearch } from '../services/dataService';
import { LAYOUT_STYLE_ITEM_GRID } from '../constants/filters';
import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface ShopItemProps {
    product: ProductFromSearch;
    layout: string; 
    onDeleteRequest: (productId: string, productTitle: string) => void;
    deleteDisabled: boolean; 

  }
  
function ShopItem({product, layout,onDeleteRequest, deleteDisabled}:ShopItemProps) {
    const { isAuthenticated } = useAuth();
    const images = product.images ? product.images.filter(Boolean) as string[] : [];
    const displayTitle = product.highlight?.title?.length
        ? product.highlight.title.join(' ... ') // Si hay múltiples fragmentos, únelos o toma el primero
        : product.title;
    const title = product.highlight?.title?.length ? (
            <span dangerouslySetInnerHTML={{ __html: displayTitle }} />
          ) : (
            product.title
          )

    const displayDescription = product.highlight?.description?.length
    ? product.highlight.description.join(' ... ') 
    : product.description || ""; 

    const description = product.highlight?.description?.length ? (
            <span dangerouslySetInnerHTML={{ __html: displayDescription }} />
          ) : (
            product.description // O product.description?.substring(0, 200) + '...'
          )

    const handleDeleteClick = () => {
      onDeleteRequest(product.id, product.title);
    };

  return (
    <div className={clsx(
      "flex bg-white w-full rounded-md overflow-hidden mx-auto  sm:hover:[box-shadow:0_0_12px_rgba(0,0,0,.15)]",
      layout === LAYOUT_STYLE_ITEM_GRID
        ? "flex-col"
        : "flex-row"
    )}>
        <div className="flex flex-col">
            <div className=' flex h-[231px]  items-center justify-center'>
                    {product.images && <Slider
                        key={product.code}
                        paths={images}
                        containerClassName={clsx(
                          "",
                          layout === LAYOUT_STYLE_ITEM_GRID
                            ? "h-full w-full flex"
                            : "flex-row w-[250px]"
                        )} 
                        imageClassName="h-full w-full object-cover"
                    />}
            </div>
            {/* Add to cart button*/}
            <div className={clsx(
                          "flex items-end justify-end pr-4 gap-1",
                          layout === LAYOUT_STYLE_ITEM_GRID
                            ? "-mt-6 "
                            : "relative -mt-10 -top-10 -right-4  "
                        )}>
                           {isAuthenticated && (
                              <button 
                                disabled={deleteDisabled}
                                onClick={handleDeleteClick}
                                className='rounded-full bg-red-400 border  border-white p-2 z-10 hover:[box-shadow:0_4px_0_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out'>
                                    <TrashIcon className='w-6 h-6 text-white'/>
                              </button>
                                     )}
                
                <div className='rounded-full bg-primary border  border-white p-2 z-10 hover:[box-shadow:0_4px_0_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out'>
                    <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/>
                    </svg>
                </div>
            </div>
           
        </div>
         {/* Product Information */}

        <div className=" p-4">
            <p className="font-graphik font-medium text-black mb-2 max-h-12 overflow-hidden">{title}</p>
            <div className="flex flex-row  justify-between w-full mb-1 [&>span]:text-lightgrey [&>span]:font-thin  [&>span]:text-xs">
                {
                // product.categories.map((productCategory)=> {
                //     return <span>{productCategory.category.name}</span>
                //     })
                    
        }
                <span>COD: {product.code}</span>
            </div>
            <div className="font-medium text-primary mb-1">UYU {product.price}</div>
            <p className="font-graphik text-xs text-black mb-2 max-h-24 overflow-hidden">
             {description}
            </p>
        </div>
  </div>
  )
}

export default ShopItem