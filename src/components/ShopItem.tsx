import Slider from './Slider';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  
function ShopItem({product, layout, onDeleteRequest, deleteDisabled}: ShopItemProps) {
    const { isAuthenticated } = useAuth();
    const images = product.images ? product.images.filter(Boolean) as string[] : [];
    const displayTitle = product.highlight?.title?.length
        ? product.highlight.title.join(' ... ')
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
            product.description
          )

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      onDeleteRequest(product.id, product.title);
    };

    const handleAddToCartClick = (e: React.MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      
      console.log('Agregando al carrito:', product.title);
    };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="block group cursor-pointer"
    >
      <div className={clsx(
        "flex bg-white w-full rounded-md overflow-hidden mx-auto transition-all duration-200",
        "group-hover:[box-shadow:0_0_16px_rgba(0,0,0,.2)] group-hover:scale-[1.02]",
        layout === LAYOUT_STYLE_ITEM_GRID
          ? "flex-col"
          : "flex-row"
      )}>
          <div className="flex flex-col relative">
              <div className='flex h-[231px] items-center justify-center'>
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
              
              {/* Action buttons - Positioned absolutely to prevent layout shift */}
              <div className={clsx(
                            "absolute flex items-end justify-end pr-4 gap-1 z-20",
                            layout === LAYOUT_STYLE_ITEM_GRID
                              ? "bottom-2 right-0"
                              : "bottom-2 right-0"
                          )}>
                             {isAuthenticated && (
                                <button 
                                  disabled={deleteDisabled}
                                  onClick={handleDeleteClick}
                                  className='rounded-full bg-red-400 border border-white p-2 hover:[box-shadow:0_4px_0_rgba(0,0,0,0.15)] hover:bg-red-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                                  aria-label={`Eliminar ${product.title}`}
                                >
                                      <TrashIcon className='w-6 h-6 text-white'/>
                                </button>
                                       )}
                  
                  <button 
                    onClick={handleAddToCartClick}
                    className='rounded-full bg-primary border border-white p-2 hover:[box-shadow:0_4px_0_rgba(0,0,0,0.15)] hover:bg-primary_light transition-all duration-150 ease-in-out'
                    aria-label={`Agregar ${product.title} al carrito`}
                  >
                      <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/>
                      </svg>
                  </button>
              </div>
             
          </div>
           {/* Product Information */}
          <div className="p-4 flex-1">
              <p className="font-graphik font-medium text-black mb-2 max-h-12 overflow-hidden group-hover:text-primary transition-colors">{title}</p>
              <div className="flex flex-row justify-between w-full mb-1 [&>span]:text-lightgrey [&>span]:font-thin [&>span]:text-xs">
                  <span>COD: {product.code}</span>
              </div>
              <div className="font-medium text-primary mb-1">UYU {product.price}</div>
              <p className="font-graphik text-xs text-black mb-2 max-h-24 overflow-hidden">
               {description}
              </p>
          </div>
      </div>
    </Link>
  )
}

export default ShopItem