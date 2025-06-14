import { useState } from 'react';
import { StarIcon, PlusIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import Slider from './Slider';
import type { ProductFromSearch } from '../services/dataService';
import { StorageImage } from '@aws-amplify/ui-react-storage';

interface ProductDetailProps {
  product: ProductFromSearch;
}

function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const images = product.images ? product.images.filter(Boolean) as string[] : [];
  
  // Simulated rating - you can replace this with actual rating data
  const rating = 4.5;
  const hasRating = true;

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

   const handleWhatsAppOrder = () => {
    const whatsappNumber = "59892878051";
    const currentUrl = window.location.href;
    const message = `¡Hola! Me interesa este producto:

 *${product.title.trim()}*
 Precio: ${product.price?.toLocaleString()}
 Código: ${product.code}

 Link del producto: ${currentUrl}

¿Podrías darme más información?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column - Images (3/5 of the width) */}
        <div className="lg:col-span-3">
          <div className="flex gap-4">
            {/* Thumbnail Images - Left Side */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`w-16 h-16 border-2 rounded-md overflow-hidden ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <StorageImage
                      alt={`slide-${index}`}
                      path={image}
                      className={"w-full h-full object-cover"}
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="aspect-square flex items-center justify-center">
                {images.length > 0 ? (
                  <StorageImage
                    alt={`slide-${selectedImageIndex}`}
                    path={images[selectedImageIndex]}
                    className={"w-full h-full object-cover"}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Page Indicator Dots - Below main image */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedImageIndex === index ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info (2/5 of the width) */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Category and Code */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm text-gray-500 uppercase">
              BIBLIAS DE ESTUDIO • COD: {product.code}
            </div>
            {hasRating && (
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 text-yellow-400" />
              </div>
            )}
          </div>

          {/* Product Title */}
          <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-4 leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="text-3xl font-bold text-primary mb-6">
            ${product.price?.toLocaleString()}
          </div>

          {/* Short Description */}
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Biblia de Estudio de la Vida Plena
            </p>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mb-6">
              <div className="text-gray-700">
                {showFullDescription ? (
                  <p>{product.description}</p>
                ) : (
                  <p>{product.description.length > 200 ? `${product.description.substring(0, 200)}...` : product.description}</p>
                )}
              </div>
              
              {product.description.length > 200 && (
                <button
                  onClick={toggleDescription}
                  className="text-yellow-500 text-sm font-medium mt-2 hover:underline"
                >
                  {showFullDescription ? 'VER MENOS' : 'VER MÁS'}
                </button>
              )}
            </div>
          )}
          
          {/* Spacer to push buttons to bottom */}
          <div className='flex-1'></div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            {/* Add to Cart Button */}
            <button className="w-1/2 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>Add Item</span>
              <PlusIcon className="w-5 h-5" />
            </button>

            {/* WhatsApp Order Button */}
            <button 
            onClick={handleWhatsAppOrder}
            className="flex w-1/2 items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Order on</div>
                <div className="text-sm font-bold">WhatsApp</div>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500">
            <p>Disponible para entrega inmediata</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;