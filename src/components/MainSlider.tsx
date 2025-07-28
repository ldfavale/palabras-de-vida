import React, { useState, useEffect } from 'react'; // Importa React
import Slider from './Slider';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';

// Tipa el componente funcional
const MainSlider: React.FC = () => { // <--- Usa React.FC

  // Especifica el tipo del estado como un array de strings
  const [images, setImages] = useState<string[]>([]); // <--- ¡Aquí el cambio!
  const [loading, setLoading] = useState<boolean>(true); // Opcional: loading state
  const [error, setError] = useState<string | null>(null); // Opcional: error state

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    let isMounted = true; // Para evitar updates en componente desmontado

    const loadImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Asegúrate que el tipo del módulo importado es correcto
        // Vite/TS con .d.ts generalmente devuelve { default: string }
        let imageModules: { default: string }[];

        if (window.matchMedia("(min-width: 768px)").matches) { // Usar matchMedia es más robusto
          imageModules = await Promise.all([
            import('../assets/images/slider/desktop/2.png'),
            import('../assets/images/slider/desktop/3.png'),
            import('../assets/images/slider/desktop/4.png'),
            import('../assets/images/slider/desktop/5.png'),
            import('../assets/images/slider/desktop/6.png'),
            import('../assets/images/slider/desktop/7.png')
          ]);
        } else {
          imageModules = await Promise.all([
            import('../assets/images/slider/mobile/2.png'),
            import('../assets/images/slider/mobile/3.png'),
            import('../assets/images/slider/mobile/4.png'),
            import('../assets/images/slider/mobile/5.png'),
            import('../assets/images/slider/mobile/6.png'),
            import('../assets/images/slider/mobile/7.png')
          ]);
        }

        if (isMounted) {
          // Ahora setImages espera string[] y le pasas string[]
          setImages(imageModules.map(img => img.default));
        }
      } catch (err) {
        console.error("Error loading images:", err);
        if (isMounted) {
          setError("Error al cargar las imágenes.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false; // Cleanup: marcar como desmontado
    };
  }, []); // El array vacío asegura que se ejecuta solo al montar

  // --- Renderizado Condicional (Opcional pero recomendado) ---
  if (loading) {
    return <div className='px-4 md:px-10 lg:px-0 pt-[80px] md:pt-[105px] flex justify-center items-center min-h-[50vh]'>Cargando Slider...</div>; // O un spinner
  }

  if (error) {
     return <div className='px-4 md:px-10 lg:px-0 pt-[80px] md:pt-[105px] flex justify-center items-center min-h-[50vh] text-red-500'>{error}</div>;
  }

  if (images.length === 0) {
     return <div className='px-4 md:px-10 lg:px-0 pt-[80px] md:pt-[105px] flex justify-center items-center min-h-[50vh]'>No hay imágenes para mostrar.</div>;
  }

  return (
    <div
      ref={ref}
      className={clsx(
        'px-4 md:px-10 lg:px-0 pt-[80px] md:pt-[105px] transition-all duration-1000 ease-out transform',
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
    >
      {/* Asegúrate que Slider pueda manejar las props correctamente */}
      <Slider
        images={images} // images es ahora string[]
        carouselClassName="rounded-xl"
        imageClassName="h-full md:h-[75vh] w-full object-cover"
        navigation={true} // O {true} si espera booleano explícito
      />
    </div>
  );
}; // <--- Cierre del componente

export default MainSlider;