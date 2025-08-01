import Slider from './Slider';
import { Link } from 'react-router-dom';
import type { ProductFromSearch } from '../services/dataService';
import { LAYOUT_STYLE_ITEM_GRID } from '../constants/filters';
import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { useAuth } from '../hooks/useAuth';

interface ShopItemProps {
    product: ProductFromSearch;
    layout: string; 
    onDeleteRequest: (productId: string, productTitle: string) => void;
    deleteDisabled: boolean; 
}
  
function ShopItem({product, layout, onDeleteRequest, deleteDisabled}: ShopItemProps) {
    const { isAuthenticated } = useAuth();
    const { handleWhatsAppOrder } = useWhatsAppOrder(product);
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
                            "absolute flex items-end justify-end pr-4 gap-1 z-10",
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
                    onClick={handleWhatsAppOrder}
                    className='rounded-full bg-green-300 border border-white p-2 hover:[box-shadow:0_4px_0_rgba(0,0,0,0.15)] hover:bg-green-400 transition-all duration-150 ease-in-out'
                    aria-label={`Pedir ${product.title} por WhatsApp`}
                  >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688" />
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