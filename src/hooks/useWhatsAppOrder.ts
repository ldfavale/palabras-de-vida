import type { ProductFromSearch } from '../services/dataService';

// El número de WhatsApp se define como una constante aquí para que sea fácil de cambiar en el futuro.
const WHATSAPP_NUMBER = "59899254043";

/**
 * Un custom hook para generar y manejar la lógica de un pedido por WhatsApp.
 * 
 * @param product - El objeto del producto por el cual se va a consultar.
 * @returns Una función `handleWhatsAppOrder` para ser usada en un evento onClick.
 */
export function useWhatsAppOrder(product: ProductFromSearch) {

  const handleWhatsAppOrder = (e?: React.MouseEvent) => {
    // Prevenimos el comportamiento por defecto (como seguir un link) y la propagación del evento.
    e?.preventDefault();
    e?.stopPropagation();

    if (!product) return;

    // Construimos la URL del producto para incluirla en el mensaje.
    const productUrl = `${window.location.origin}/product/${product.id}`;

    // Creamos el mensaje pre-llenado.
    const message = `¡Hola! Me interesa este producto:

*${product.title.trim()}*
Precio: UYU ${product.price?.toLocaleString()}
Código: ${product.code}

Link del producto: ${productUrl}

¿Podrían darme más información?`;
    
    // Codificamos el mensaje para que sea seguro en una URL.
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abrimos la URL de WhatsApp en una nueva pestaña.
    window.open(whatsappUrl, '_blank');
  };

  return { handleWhatsAppOrder };
}
